import express from 'express';
import nodemailer from 'nodemailer';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Send test email
router.post('/test', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { smtpConfig } = req.body;

    if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      return res.status(400).json({ error: 'SMTP configuration is incomplete' });
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

    // Send test email
    const info = await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: req.user!.email,
      subject: 'Teste de Configuração de Email - Meu NPS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #073143;">Teste de Email Bem-Sucedido!</h1>
          <p>Olá ${req.user!.name},</p>
          <p>Este é um email de teste para confirmar que suas configurações de SMTP estão funcionando corretamente.</p>
          <p>Agora você pode enviar emails através da plataforma Meu NPS.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">© 2025 Meu NPS. Todos os direitos reservados.</p>
        </div>
      `,
    });

    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send test email'
    });
  }
});

// Send campaign emails
router.post('/campaign', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { campaignId, contactIds, subject, message, includeLink } = req.body;

    if (!campaignId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'Campaign ID and contact IDs are required' });
    }

    const db = Database.getInstance();

    // Get user's SMTP configuration
    const config = await db.get(
      'SELECT integrations FROM app_configs WHERE user_id = ?',
      [req.user!.id]
    );

    if (!config) {
      return res.status(400).json({ error: 'SMTP not configured' });
    }

    const integrations = JSON.parse(config.integrations || '{}');
    const smtpConfig = integrations.smtp;

    if (!smtpConfig?.enabled) {
      return res.status(400).json({ error: 'SMTP not enabled' });
    }

    // Get campaign details
    const campaign = await db.get(
      'SELECT name, description FROM campaigns WHERE id = ? AND user_id = ?',
      [campaignId, req.user!.id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get contacts
    const contacts = await db.all(
      `SELECT name, email, phone, company, position FROM contacts 
       WHERE id IN (${contactIds.map(() => '?').join(',')}) AND user_id = ?`,
      [...contactIds, req.user!.id]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'No valid contacts found' });
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

    // Send emails
    const results = [];
    const surveyUrl = `${req.get('origin') || 'http://localhost:5173'}/survey/${campaignId}`;

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

    res.json({
      success: true,
      message: `Emails enviados: ${successCount} sucessos, ${failureCount} falhas`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Send campaign emails error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

export default router;