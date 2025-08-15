import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';
import nodemailer from 'npm:nodemailer@6.9.13';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  campaignId: string;
  contactIds: string[];
  subject: string;
  message: string;
  includeLink: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get the request body
    const { campaignId, contactIds, subject, message, includeLink }: EmailRequest = await req.json();

    // Validate required fields
    if (!campaignId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign ID and contact IDs are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the token from the authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token or user not found' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user's SMTP configuration
    const { data: appConfig, error: configError } = await supabase
      .from('app_configs')
      .select('integrations')
      .eq('user_id', user.id)
      .single();

    if (configError || !appConfig?.integrations?.smtp?.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMTP not configured. Please configure email settings first.' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const smtpConfig = appConfig.integrations.smtp;

    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      return new Response(
        JSON.stringify({ success: false, error: 'SMTP configuration is incomplete' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('name, description')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('name, email, phone, company, position')
      .in('id', contactIds)
      .eq('user_id', user.id);

    if (contactsError || !contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid contacts found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Send emails to each contact
    const results = [];
    const surveyUrl = `${req.headers.get('origin') || 'https://localhost:5173'}/survey/${campaignId}`;

    for (const contact of contacts) {
      try {
        // Personalize content
        const personalizedSubject = personalizeContent(subject, contact, campaign, surveyUrl);
        const personalizedMessage = personalizeContent(message, contact, campaign, surveyUrl);

        // Create HTML email
        const htmlContent = createEmailTemplate(
          personalizedMessage,
          contact,
          campaign,
          surveyUrl,
          includeLink,
          smtpConfig.fromName
        );

        // Send email
        const info = await transporter.sendMail({
          from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
          to: `"${contact.name}" <${contact.email}>`,
          subject: personalizedSubject,
          text: personalizedMessage + (includeLink ? `\n\nLink da pesquisa: ${surveyUrl}` : ''),
          html: htmlContent,
        });

        results.push({
          contact: contact.email,
          success: true,
          messageId: info.messageId
        });

      } catch (emailError) {
        console.error(`Error sending email to ${contact.email}:`, emailError);
        results.push({
          contact: contact.email,
          success: false,
          error: emailError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails enviados: ${successCount} sucessos, ${failureCount} falhas`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error sending campaign emails:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send campaign emails',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

function personalizeContent(content: string, contact: any, campaign: any, surveyUrl: string): string {
  return content
    .replace(/\{\{nome\}\}/g, contact.name)
    .replace(/\{\{email\}\}/g, contact.email)
    .replace(/\{\{telefone\}\}/g, contact.phone || '')
    .replace(/\{\{empresa\}\}/g, contact.company || '')
    .replace(/\{\{cargo\}\}/g, contact.position || '')
    .replace(/\{\{campanha\}\}/g, campaign.name)
    .replace(/\{\{link_pesquisa\}\}/g, surveyUrl);
}

function createEmailTemplate(
  message: string, 
  contact: any, 
  campaign: any, 
  surveyUrl: string, 
  includeLink: boolean,
  fromName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #00ac75; margin-bottom: 5px;">Meu NPS</h1>
        <p style="color: #666; font-size: 14px;">Plataforma de Gestão de NPS</p>
      </div>
      
      <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #073143; margin-top: 0;">Olá ${contact.name}!</h2>
        <div style="white-space: pre-line; line-height: 1.6; color: #333;">
          ${message}
        </div>
      </div>
      
      ${includeLink ? `
        <div style="background-color: #00ac75; color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
          <h3 style="margin-top: 0; margin-bottom: 15px;">Responder Pesquisa NPS</h3>
          <p style="margin-bottom: 20px;">Clique no botão abaixo para acessar a pesquisa:</p>
          <a href="${surveyUrl}" style="display: inline-block; background-color: #073143; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Responder Pesquisa
          </a>
          <p style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
            Ou copie e cole este link: ${surveyUrl}
          </p>
        </div>
      ` : ''}
      
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
        Este email foi enviado por ${fromName} através da plataforma Meu NPS.<br>
        © 2025 Meu NPS. Todos os direitos reservados.
      </p>
    </div>
  `;
}