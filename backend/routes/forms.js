const express = require('express');
const { CampaignForm, Campaign } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get campaign form
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    // Check if campaign exists and is active (for public access)
    const campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.active) {
      return res.status(400).json({ error: 'Campaign is not active' });
    }

    const form = await CampaignForm.findOne({
      where: { campaign_id: req.params.campaignId }
    });

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

    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Get campaign form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save campaign form (authenticated)
router.post('/campaign/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Fields array is required' });
    }

    // Verify campaign belongs to user
    const campaign = await Campaign.findOne({
      where: { id: req.params.campaignId, user_id: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Upsert form
    const [form] = await CampaignForm.upsert({
      campaign_id: req.params.campaignId,
      fields,
      user_id: req.user.id
    });

    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Save campaign form error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;