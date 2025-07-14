import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';
import nodemailer from 'npm:nodemailer@6.9.13';

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Process email queue
Deno.serve(async (req) => {
  try {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Get the batch size from the request or use default
    const { batchSize = 10 } = await req.json();

    // Get pending emails from the queue
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select(`
        id, 
        campaign_id, 
        contact_id, 
        subject, 
        body, 
        campaigns(user_id),
        contacts(email, name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch emails from queue' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No pending emails in queue' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Group emails by user_id to use the correct SMTP settings for each user
    const emailsByUser = emails.reduce((acc, email) => {
      const userId = email.campaigns?.user_id;
      if (!userId) return acc;
      
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(email);
      return acc;
    }, {});

    const results = [];

    // Process emails for each user
    for (const userId in emailsByUser) {
      // Get user's SMTP settings
      const { data: appConfig, error: configError } = await supabase
        .from('app_configs')
        .select('integrations')
        .eq('user_id', userId)
        .single();

      if (configError) {
        console.error(`Error fetching SMTP settings for user ${userId}:`, configError);
        // Mark these emails as error
        for (const email of emailsByUser[userId]) {
          await supabase
            .from('email_queue')
            .update({
              status: 'error',
              error: 'Failed to fetch SMTP settings',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);
        }
        continue;
      }

      const smtpConfig = appConfig?.integrations?.smtp;
      const zenviaConfig = appConfig?.integrations?.zenvia?.email;

      // Determine which email service to use
      let emailService = null;
      let serviceType = '';

      if (smtpConfig?.enabled) {
        emailService = createSmtpTransport(smtpConfig);
        serviceType = 'smtp';
      } else if (zenviaConfig?.enabled) {
        emailService = createZenviaService(zenviaConfig);
        serviceType = 'zenvia';
      }

      if (!emailService) {
        // No email service configured, mark emails as error
        for (const email of emailsByUser[userId]) {
          await supabase
            .from('email_queue')
            .update({
              status: 'error',
              error: 'No email service configured',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);
        }
        continue;
      }

      // Send emails using the configured service
      for (const email of emailsByUser[userId]) {
        try {
          // Update status to processing
          await supabase
            .from('email_queue')
            .update({
              status: 'processing',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);

          // Send email
          if (serviceType === 'smtp') {
            await sendSmtpEmail(
              emailService,
              smtpConfig,
              email.contacts?.email,
              email.contacts?.name,
              email.subject,
              email.body
            );
          } else if (serviceType === 'zenvia') {
            await sendZenviaEmail(
              emailService,
              zenviaConfig,
              email.contacts?.email,
              email.contacts?.name,
              email.subject,
              email.body
            );
          }

          // Update status to sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);

          results.push({
            id: email.id,
            status: 'sent',
            email: email.contacts?.email
          });
        } catch (error) {
          console.error(`Error sending email ${email.id}:`, error);
          
          // Update status to error
          await supabase
            .from('email_queue')
            .update({
              status: 'error',
              error: error.message || 'Unknown error',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);

          results.push({
            id: email.id,
            status: 'error',
            email: email.contacts?.email,
            error: error.message
          });
        }

        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error processing email queue:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process email queue'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

// Create SMTP transport
function createSmtpTransport(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });
}

// Create ZenVia service (simulated)
function createZenviaService(config) {
  // This is a placeholder for the ZenVia service
  // In a real implementation, you would create a client for the ZenVia API
  return {
    apiKey: config.apiKey,
    fromEmail: config.fromEmail,
    fromName: config.fromName
  };
}

// Send email using SMTP
async function sendSmtpEmail(transport, config, to, toName, subject, body) {
  await transport.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: toName ? `"${toName}" <${to}>` : to,
    subject: subject,
    text: body,
  });
}

// Send email using ZenVia (simulated)
async function sendZenviaEmail(service, config, to, toName, subject, body) {
  // In a real implementation, you would call the ZenVia API
  // This is a placeholder that simulates sending an email
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate random errors (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Simulated ZenVia API error');
  }
  
  // Return success
  return {
    id: crypto.randomUUID(),
    status: 'sent'
  };
}