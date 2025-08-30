import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all campaigns for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    const campaigns = await db.all(
      'SELECT * FROM campaigns WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    );

    // Parse JSON fields
    const parsedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      survey_customization: JSON.parse(campaign.survey_customization || '{}'),
      automation: JSON.parse(campaign.automation || '{}')
    }));

    res.json({ success: true, data: parsedCampaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single campaign
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Parse JSON fields
    const parsedCampaign = {
      ...campaign,
      survey_customization: JSON.parse(campaign.survey_customization || '{}'),
      automation: JSON.parse(campaign.automation || '{}')
    };

    res.json({ success: true, data: parsedCampaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create campaign
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      active,
      default_source_id,
      default_group_id,
      survey_customization,
      automation
    } = req.body;

    if (!name || !start_date) {
      return res.status(400).json({ error: 'Name and start date are required' });
    }

    const db = Database.getInstance();
    const campaignId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO campaigns (
        id, name, description, start_date, end_date, active,
        default_source_id, default_group_id, survey_customization,
        automation, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campaignId,
        name,
        description || null,
        start_date,
        end_date || null,
        active !== undefined ? active : true,
        default_source_id || null,
        default_group_id || null,
        JSON.stringify(survey_customization || {}),
        JSON.stringify(automation || {}),
        req.user!.id,
        now,
        now
      ]
    );

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...campaign,
        survey_customization: JSON.parse(campaign.survey_customization || '{}'),
        automation: JSON.parse(campaign.automation || '{}')
      }
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      active,
      default_source_id,
      default_group_id,
      survey_customization,
      automation
    } = req.body;

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      `UPDATE campaigns SET 
        name = ?, description = ?, start_date = ?, end_date = ?, active = ?,
        default_source_id = ?, default_group_id = ?, survey_customization = ?,
        automation = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`,
      [
        name,
        description,
        start_date,
        end_date,
        active,
        default_source_id,
        default_group_id,
        JSON.stringify(survey_customization || {}),
        JSON.stringify(automation || {}),
        now,
        req.params.id,
        req.user!.id
      ]
    );

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      data: {
        ...campaign,
        survey_customization: JSON.parse(campaign.survey_customization || '{}'),
        automation: JSON.parse(campaign.automation || '{}')
      }
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    // Check if campaign exists and belongs to user
    const campaign = await db.get(
      'SELECT id FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete campaign (CASCADE will handle related data)
    await db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;