import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';
import nodemailer from 'npm:nodemailer@6.9.13';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const { smtpConfig } = await req.json();

    // Validate SMTP configuration
    if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      return new Response(
        JSON.stringify({ success: false, error: 'SMTP configuration is incomplete' }),
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

    // Get user profile to get the name
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = profile?.name || user.email?.split('@')[0] || 'User';

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Send a test email
    const info = await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: user.email,
      subject: 'Teste de Configuração de Email - Meu NPS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #073143; margin-bottom: 5px;">Meu NPS</h1>
            <p style="color: #666; font-size: 14px;">Plataforma de Gestão de NPS</p>
          </div>
          
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #073143; margin-top: 0;">Teste de Email Bem-Sucedido!</h2>
            <p>Olá ${userName},</p>
            <p>Este é um email de teste para confirmar que suas configurações de SMTP estão funcionando corretamente.</p>
            <p>Agora você pode enviar emails através da plataforma Meu NPS.</p>
          </div>
          
          <div style="background-color: #073143; color: white; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Detalhes da Configuração</h3>
            <ul style="padding-left: 20px;">
              <li>Servidor SMTP: ${smtpConfig.host}</li>
              <li>Porta: ${smtpConfig.port}</li>
              <li>Segurança: ${smtpConfig.secure ? 'SSL/TLS' : 'Nenhuma/STARTTLS'}</li>
              <li>Remetente: ${smtpConfig.fromName} (${smtpConfig.fromEmail})</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            Este é um email automático. Por favor, não responda a este email.<br>
            © 2025 Meu NPS. Todos os direitos reservados.
          </p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: info.messageId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send test email',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});