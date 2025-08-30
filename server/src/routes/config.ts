import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get app config
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    let config = await db.get(
      'SELECT * FROM app_configs WHERE user_id = ?',
      [req.user!.id]
    );

    if (!config) {
      // Create default config
      const configId = uuidv4();
      const now = new Date().toISOString();
      const defaultConfig = {
        theme_color: '#00ac75',
        language: 'pt-BR',
        company: JSON.stringify({
          name: '',
          document: '',
          address: '',
          email: '',
          phone: ''
        }),
        integrations: JSON.stringify({
          smtp: {
            enabled: false,
            host: '',
            port: 587,
            secure: false,
            username: '',
            password: '',
            fromName: '',
            fromEmail: ''
          },
          zenvia: {
            email: {
              enabled: false,
              apiKey: '',
              fromEmail: '',
              fromName: ''
            },
            sms: {
              enabled: false,
              apiKey: '',
              from: ''
            },
            whatsapp: {
              enabled: false,
              apiKey: '',
              from: ''
            }
          }
        })
      };

      await db.run(
        'INSERT INTO app_configs (id, user_id, theme_color, language, company, integrations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [configId, req.user!.id, defaultConfig.theme_color, defaultConfig.language, defaultConfig.company, defaultConfig.integrations, now, now]
      );

      config = await db.get(
        'SELECT * FROM app_configs WHERE user_id = ?',
        [req.user!.id]
      );
    }

    // Parse JSON fields
    const parsedConfig = {
      ...config,
      company: JSON.parse(config.company || '{}'),
      integrations: JSON.parse(config.integrations || '{}')
    };

    res.json({ success: true, data: parsedConfig });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update app config
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      theme_color,
      language,
      company,
      integrations
    } = req.body;

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      'UPDATE app_configs SET theme_color = ?, language = ?, company = ?, integrations = ?, updated_at = ? WHERE user_id = ?',
      [
        theme_color,
        language,
        JSON.stringify(company || {}),
        JSON.stringify(integrations || {}),
        now,
        req.user!.id
      ]
    );

    const config = await db.get(
      'SELECT * FROM app_configs WHERE user_id = ?',
      [req.user!.id]
    );

    res.json({ 
      success: true, 
      data: {
        ...config,
        company: JSON.parse(config.company || '{}'),
        integrations: JSON.parse(config.integrations || '{}')
      }
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;