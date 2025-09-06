const express = require('express');
const { User, UserProfile } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user data
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'phone', 'company', 'position', 'avatar', 'trial_start_date', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user profile
    let profile = await UserProfile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      // Create default profile
      profile = await UserProfile.create({
        user_id: user.id,
        name: user.name,
        email: user.email,
        trial_start_date: user.trial_start_date
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      company,
      position,
      avatar,
      preferences
    } = req.body;

    // Update users table
    await User.update({
      name,
      phone,
      company,
      position,
      avatar
    }, {
      where: { id: req.user.id }
    });

    // Update user_profiles table
    const [profile] = await UserProfile.upsert({
      user_id: req.user.id,
      name,
      email: req.user.email,
      phone,
      company,
      position,
      avatar,
      preferences: preferences || {}
    });

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;