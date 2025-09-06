const express = require('express');
const { NpsResponse, Campaign } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get responses for a campaign
router.get('/campaign/:campaignId', authenticateToken, async (req, res) => {
  try {
    // Verify campaign belongs to user
    const campaign = await Campaign.findOne({
      where: { id: req.params.campaignId, user_id: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const responses = await NpsResponse.findAll({
      where: { campaign_id: req.params.campaignId },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: responses });
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

    // Check if campaign exists and is active
    const campaign = await Campaign.findByPk(campaign_id);

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
    const response = await NpsResponse.create({
      campaign_id,
      score,
      feedback,
      source_id,
      situation_id,
      group_id,
      form_responses
    });

    res.status(201).json({ 
      success: true, 
      data: { id: response.id, created_at: response.created_at }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all responses for user (across all campaigns)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const responses = await NpsResponse.findAll({
      include: [{
        model: Campaign,
        where: { user_id: req.user.id },
        attributes: []
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get all responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;