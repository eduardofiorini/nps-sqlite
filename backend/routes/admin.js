const express = require('express');
const { User, UserProfile, UserAdmin, AffiliateReferral, UserAffiliate } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: UserProfile,
        attributes: ['preferences']
      }],
      attributes: ['id', 'email', 'name', 'phone', 'company', 'position', 'avatar', 'is_deactivated', 'trial_start_date', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate user
router.post('/users/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ is_deactivated: true });

    // Deactivate all user campaigns
    const { Campaign } = require('../models');
    await Campaign.update({ active: false }, { where: { user_id: id } });

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reactivate user
router.post('/users/:id/reactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ is_deactivated: false });

    res.json({ success: true, message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get affiliate referrals (admin only)
router.get('/affiliate/referrals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const referrals = await AffiliateReferral.findAll({
      include: [
        {
          model: UserAffiliate,
          attributes: ['affiliate_code']
        },
        {
          model: UserProfile,
          as: 'affiliateProfile',
          attributes: ['name', 'email']
        },
        {
          model: UserProfile,
          as: 'referredProfile',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Get admin referrals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update referral status
router.put('/affiliate/referrals/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const referral = await AffiliateReferral.findByPk(id);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const updateData = { commission_status: status };
    if (status === 'paid') {
      updateData.paid_at = new Date();
    }

    await referral.update(updateData);

    // Update affiliate stats
    await updateAffiliateStats(referral.affiliate_user_id);

    res.json({ success: true, message: 'Referral status updated successfully' });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update affiliate statistics
async function updateAffiliateStats(affiliateUserId) {
  const { sequelize } = require('../config/database');
  
  const [results] = await sequelize.query(`
    SELECT 
      COUNT(*) as total_referrals,
      COALESCE(SUM(commission_amount), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0) as total_received,
      COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0) as total_pending
    FROM affiliate_referrals 
    WHERE affiliate_user_id = ?
  `, {
    replacements: [affiliateUserId]
  });

  const stats = results[0];

  await UserAffiliate.update({
    total_referrals: stats.total_referrals,
    total_earnings: stats.total_earnings,
    total_received: stats.total_received,
    total_pending: stats.total_pending
  }, {
    where: { user_id: affiliateUserId }
  });
}

module.exports = router;