const express = require('express');
const { AppConfig } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get app config
router.get('/', authenticateToken, async (req, res) => {
  try {
    let config = await AppConfig.findOne({
      where: { user_id: req.user.id }
    });

    if (!config) {
      // Create default config
      config = await AppConfig.create({
        user_id: req.user.id
      });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update app config
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      theme_color,
      language,
      company,
      integrations
    } = req.body;

    const [config] = await AppConfig.upsert({
      user_id: req.user.id,
      theme_color,
      language,
      company: company || {},
      integrations: integrations || {}
    });

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;