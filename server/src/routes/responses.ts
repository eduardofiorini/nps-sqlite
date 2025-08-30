import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get responses for a campaign
router.get('/campaign/:campaignId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    // Verify campaign belongs to user
    const campaign = await db.get(
      'SELECT id FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.campaignId, req.user!.id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const responses = await db.all(
      'SELECT * FROM nps_responses WHERE campaign_id = ? ORDER BY created_at DESC',
      [req.params.campaignId]
    );

    // Parse JSON fields
    const parsedResponses = responses.map(response => ({
      ...response,
      form_responses: JSON.parse(response.form_responses || '{}')
    }));

    res.json({ success: true, data: parsedResponses });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit response (public endpoint for surveys)
router.post('/submit', async (req, res) => {
  try {
    const {
      campaign_id,
      score,
      feedback,
      source_id,
      situation_id,
      group_id,
      form_responses
    } = req.body;

    if (!campaign_id || score === undefined) {
      return res.status(400).json({ error: 'Campaign ID and score are required' });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({ error: 'Score must be between 0 and 10' });
    }

    const db = Database.getInstance();

    // Check if campaign exists and is active
    const campaign = await db.get(
      'SELECT id, active, start_date, end_date FROM campaigns WHERE id = ?',
      [campaign_id]
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.active) {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    // Check date range
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

    if (now < startDate || (endDate && now > endDate)) {
      return res.status(400).json({ error: 'Campaign is not currently accepting responses' });
    }

    // Create response
    const responseId = uuidv4();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO nps_responses (
        id, campaign_id, score, feedback, source_id, situation_id,
        group_id, form_responses, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        responseId,
        campaign_id,
        score,
        feedback || null,
        source_id || null,
        situation_id || null,
        group_id || null,
        JSON.stringify(form_responses || {}),
        createdAt
      ]
    );

    res.status(201).json({ 
      success: true, 
      data: { id: responseId, created_at: createdAt }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all responses for user (across all campaigns)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    const responses = await db.all(
      `SELECT r.* FROM nps_responses r
       JOIN campaigns c ON r.campaign_id = c.id
       WHERE c.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user!.id]
    );

    // Parse JSON fields
    const parsedResponses = responses.map(response => ({
      ...response,
      form_responses: JSON.parse(response.form_responses || '{}')
    }));

    res.json({ success: true, data: parsedResponses });
  } catch (error) {
    console.error('Get all responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;