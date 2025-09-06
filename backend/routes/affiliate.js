const express = require('express');
const { UserAffiliate, AffiliateReferral, UserProfile } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user affiliate data
router.get('/', authenticateToken, async (req, res) => {
  try {
    let affiliate = await UserAffiliate.findOne({
      where: { user_id: req.user.id }
    });

    if (!affiliate) {
      // Create affiliate record if it doesn't exist
      const affiliateCode = generateAffiliateCode();
      affiliate = await UserAffiliate.create({
        user_id: req.user.id,
        affiliate_code: affiliateCode
      });
    }

    res.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('Get affiliate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update affiliate data
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { bank_account } = req.body;

    const [affiliate] = await UserAffiliate.upsert({
      user_id: req.user.id,
      bank_account: bank_account || {}
    });

    res.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('Update affiliate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get affiliate referrals
router.get('/referrals', authenticateToken, async (req, res) => {
  try {
    const referrals = await AffiliateReferral.findAll({
      where: { affiliate_user_id: req.user.id },
      include: [{
        model: UserProfile,
        as: 'referredProfile',
        attributes: ['name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create referral
router.post('/referrals', async (req, res) => {
  try {
    const { affiliate_code, referred_user_id, subscription_id, commission_amount } = req.body;

    if (!affiliate_code || !referred_user_id) {
      return res.status(400).json({ error: 'Affiliate code and referred user ID are required' });
    }

    // Find affiliate by code
    const affiliate = await UserAffiliate.findOne({
      where: { affiliate_code }
    });

    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate code not found' });
    }

    // Prevent self-referral
    if (affiliate.user_id === referred_user_id) {
      return res.status(400).json({ error: 'Cannot create self-referral' });
    }

    // Create referral
    const referral = await AffiliateReferral.create({
      affiliate_user_id: affiliate.user_id,
      referred_user_id,
      subscription_id,
      commission_amount: commission_amount || 25.00
    });

    // Update affiliate stats
    await updateAffiliateStats(affiliate.user_id);

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    console.error('Create referral error:', error);
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

function generateAffiliateCode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
}

module.exports = router;