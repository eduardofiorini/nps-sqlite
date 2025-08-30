import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get campaign form
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const db = Database.getInstance();
    
    // Check if campaign exists and is active (for public access)
    const campaign = await db.get(
      'SELECT id, active, start_date, end_date FROM campaigns WHERE id = ?',
      [req.params.campaignId]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.active) {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    const form = await db.get(
      'SELECT * FROM campaign_forms WHERE campaign_id = ?',
      [req.params.campaignId]
    );

    if (!form) {
      // Return default form if none exists
      const defaultForm = {
        id: 'default-form',
        campaign_id: req.params.campaignId,
        fields: [
          {
            id: 'nps-field',
            type: 'nps',
            label: 'O quanto você recomendaria nosso serviço para um amigo ou colega?',
            required: true,
            order: 0,
          },
          {
            id: 'feedback-field',
            type: 'text',
            label: 'Por favor, compartilhe seu feedback',
            required: false,
            order: 1,
          }
        ]
      };
      return res.json({ success: true, data: defaultForm });
    }

    // Parse JSON fields
    const parsedForm = {
      ...form,
      fields: JSON.parse(form.fields || '[]')
    };

    res.json({ success: true, data: parsedForm });
  } catch (error) {
    console.error('Get campaign form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save campaign form (authenticated)
router.post('/campaign/:campaignId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Fields array is required' });
    }

    const db = Database.getInstance();

    // Verify campaign belongs to user
    const campaign = await db.get(
      'SELECT id FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.campaignId, req.user!.id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const now = new Date().toISOString();

    // Check if form exists
    const existingForm = await db.get(
      'SELECT id FROM campaign_forms WHERE campaign_id = ?',
      [req.params.campaignId]
    );

    if (existingForm) {
      // Update existing form
      await db.run(
        'UPDATE campaign_forms SET fields = ?, updated_at = ? WHERE campaign_id = ?',
        [JSON.stringify(fields), now, req.params.campaignId]
      );
    } else {
      // Create new form
      const formId = uuidv4();
      await db.run(
        'INSERT INTO campaign_forms (id, campaign_id, fields, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [formId, req.params.campaignId, JSON.stringify(fields), req.user!.id, now, now]
      );
    }

    const form = await db.get(
      'SELECT * FROM campaign_forms WHERE campaign_id = ?',
      [req.params.campaignId]
    );

    res.json({ 
      success: true, 
      data: {
        ...form,
        fields: JSON.parse(form.fields || '[]')
      }
    });
  } catch (error) {
    console.error('Save campaign form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;