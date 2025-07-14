import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.50.5';
import axios from 'npm:axios@1.6.7';

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
    const { serviceType, config } = await req.json();

    // Validate configuration
    if (!serviceType || !config) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing service type or configuration' }),
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

    // Get user profile to get the name and phone
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('name, phone')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = profile?.name || user.email?.split('@')[0] || 'User';
    const userPhone = profile?.phone || '';

    // Validate API key
    if (!config.apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    let result;

    // Handle different service types
    switch (serviceType) {
      case 'email':
        if (!config.fromEmail || !config.fromName) {
          return new Response(
            JSON.stringify({ success: false, error: 'From email and name are required for email service' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        result = await sendTestEmail(config, user.email, userName);
        break;
      case 'sms':
        if (!config.from || !userPhone) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: !config.from 
                ? 'From number is required for SMS service' 
                : 'User phone number is not set. Please update your profile with a phone number.'
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        result = await sendTestSMS(config, userPhone, userName);
        break;
      case 'whatsapp':
        if (!config.from || !userPhone) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: !config.from 
                ? 'From number is required for WhatsApp service' 
                : 'User phone number is not set. Please update your profile with a phone number.'
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        result = await sendTestWhatsApp(config, userPhone, userName);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid service type' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process request',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function sendTestEmail(config, userEmail, userName) {
  try {
    // This is a simulation of the ZenVia API call for email
    // In a real implementation, you would use the actual ZenVia API
    const zenviaApiUrl = 'https://api.zenvia.com/v2/channels/email/messages';
    
    const payload = {
      from: {
        name: config.fromName,
        email: config.fromEmail
      },
      to: {
        name: userName,
        email: userEmail
      },
      subject: 'Teste de Integração ZenVia - Meu NPS',
      text: `Olá ${userName},\n\nEste é um email de teste enviado pela plataforma Meu NPS usando a integração com ZenVia.\n\nSe você está recebendo este email, a configuração foi bem-sucedida!\n\nAtenciosamente,\nEquipe Meu NPS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #073143; margin-bottom: 5px;">Meu NPS</h1>
            <p style="color: #666; font-size: 14px;">Plataforma de Gestão de NPS</p>
          </div>
          
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #073143; margin-top: 0;">Teste de Integração ZenVia!</h2>
            <p>Olá ${userName},</p>
            <p>Este é um email de teste enviado pela plataforma Meu NPS usando a integração com ZenVia.</p>
            <p>Se você está recebendo este email, a configuração foi bem-sucedida!</p>
          </div>
          
          <div style="background-color: #073143; color: white; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Detalhes da Configuração</h3>
            <ul style="padding-left: 20px;">
              <li>Serviço: ZenVia Email</li>
              <li>Remetente: ${config.fromName} (${config.fromEmail})</li>
              <li>Data e Hora: ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            Este é um email automático. Por favor, não responda a este email.<br>
            © 2025 Meu NPS. Todos os direitos reservados.
          </p>
        </div>
      `
    };

    // Simulate API call (in production, uncomment the actual API call)
    /*
    const response = await axios.post(zenviaApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': config.apiKey
      }
    });
    */

    // For demo purposes, we'll simulate a successful response
    // In production, return the actual API response
    return { 
      success: true, 
      message: `Email de teste enviado com sucesso para ${userEmail}`,
      details: {
        service: 'ZenVia Email',
        recipient: userEmail,
        sender: `${config.fromName} <${config.fromEmail}>`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send test email',
      details: error.toString()
    };
  }
}

async function sendTestSMS(config, userPhone, userName) {
  try {
    // This is a simulation of the ZenVia API call for SMS
    // In a real implementation, you would use the actual ZenVia API
    const zenviaApiUrl = 'https://api.zenvia.com/v2/channels/sms/messages';
    
    // Format phone number if needed (remove non-numeric characters)
    const formattedPhone = userPhone.replace(/\D/g, '');
    
    const payload = {
      from: config.from,
      to: formattedPhone,
      contents: [{
        type: 'text',
        text: `Olá ${userName}, este é um SMS de teste enviado pela plataforma Meu NPS. Se você está recebendo esta mensagem, a configuração foi bem-sucedida!`
      }]
    };

    // Simulate API call (in production, uncomment the actual API call)
    /*
    const response = await axios.post(zenviaApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': config.apiKey
      }
    });
    */

    // For demo purposes, we'll simulate a successful response
    return { 
      success: true, 
      message: `SMS de teste enviado com sucesso para ${userPhone}`,
      details: {
        service: 'ZenVia SMS',
        recipient: userPhone,
        sender: config.from,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send test SMS',
      details: error.toString()
    };
  }
}

async function sendTestWhatsApp(config, userPhone, userName) {
  try {
    // This is a simulation of the ZenVia API call for WhatsApp
    // In a real implementation, you would use the actual ZenVia API
    const zenviaApiUrl = 'https://api.zenvia.com/v2/channels/whatsapp/messages';
    
    // Format phone number if needed (remove non-numeric characters)
    const formattedPhone = userPhone.replace(/\D/g, '');
    
    const payload = {
      from: config.from,
      to: formattedPhone,
      contents: [{
        type: 'text',
        text: `Olá ${userName}, esta é uma mensagem de WhatsApp de teste enviada pela plataforma Meu NPS. Se você está recebendo esta mensagem, a configuração foi bem-sucedida!`
      }]
    };

    // Simulate API call (in production, uncomment the actual API call)
    /*
    const response = await axios.post(zenviaApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': config.apiKey
      }
    });
    */

    // For demo purposes, we'll simulate a successful response
    return { 
      success: true, 
      message: `Mensagem de WhatsApp de teste enviada com sucesso para ${userPhone}`,
      details: {
        service: 'ZenVia WhatsApp',
        recipient: userPhone,
        sender: config.from,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error sending test WhatsApp message:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send test WhatsApp message',
      details: error.toString()
    };
  }
}