const express = require('express');
const { Campaign } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all campaigns for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single campaign
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create campaign
router.post('/', authenticateToken, async (req, res) => {
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

    const campaign = await Campaign.create({
      name,
      description,
      start_date,
      end_date,
      active: active !== undefined ? active : true,
      default_source_id,
      default_group_id,
      survey_customization,
      automation,
      user_id: req.user.id
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign
router.put('/:id', authenticateToken, async (req, res) => {
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

    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await campaign.update({
      name,
      description,
      start_date,
      end_date,
      active,
      default_source_id,
      default_group_id,
      survey_customization,
      automation
    });

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await campaign.destroy();

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;