import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user affiliate data
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    let affiliate = await db.get(
      'SELECT * FROM user_affiliates WHERE user_id = ?',
      [req.user!.id]
    );

    if (!affiliate) {
      // Create affiliate record if it doesn't exist
      const affiliateId = uuidv4();
      const affiliateCode = generateAffiliateCode();
      const now = new Date().toISOString();

      await db.run(
        'INSERT INTO user_affiliates (id, user_id, affiliate_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [affiliateId, req.user!.id, affiliateCode, now, now]
      );

      affiliate = await db.get(
        'SELECT * FROM user_affiliates WHERE user_id = ?',
        [req.user!.id]
      );
    }

    // Parse JSON fields
    const parsedAffiliate = {
      ...affiliate,
      bank_account: JSON.parse(affiliate.bank_account || '{}')
    };

    res.json({ success: true, data: parsedAffiliate });
  } catch (error) {
    console.error('Get affiliate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update affiliate data
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bank_account } = req.body;

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      'UPDATE user_affiliates SET bank_account = ?, updated_at = ? WHERE user_id = ?',
      [JSON.stringify(bank_account || {}), now, req.user!.id]
    );

    const affiliate = await db.get(
      'SELECT * FROM user_affiliates WHERE user_id = ?',
      [req.user!.id]
    );

    res.json({ 
      success: true, 
      data: {
        ...affiliate,
        bank_account: JSON.parse(affiliate.bank_account || '{}')
      }
    });
  } catch (error) {
    console.error('Update affiliate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get affiliate referrals
router.get('/referrals', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    const referrals = await db.all(
      `SELECT 
        ar.*,
        up_referred.name as referred_name,
        up_referred.email as referred_email
       FROM affiliate_referrals ar
       LEFT JOIN user_profiles up_referred ON ar.referred_user_id = up_referred.user_id
       WHERE ar.affiliate_user_id = ?
       ORDER BY ar.created_at DESC`,
      [req.user!.id]
    );

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

    const db = Database.getInstance();

    // Find affiliate by code
    const affiliate = await db.get(
      'SELECT user_id FROM user_affiliates WHERE affiliate_code = ?',
      [affiliate_code]
    );

    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate code not found' });
    }

    // Prevent self-referral
    if (affiliate.user_id === referred_user_id) {
      return res.status(400).json({ error: 'Cannot create self-referral' });
    }

    // Create referral
    const referralId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO affiliate_referrals (id, affiliate_user_id, referred_user_id, subscription_id, commission_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [referralId, affiliate.user_id, referred_user_id, subscription_id || null, commission_amount || 25.00, now, now]
    );

    // Update affiliate stats
    await updateAffiliateStats(affiliate.user_id);

    res.status(201).json({ success: true, data: { id: referralId } });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update affiliate statistics
async function updateAffiliateStats(affiliateUserId: string) {
  const db = Database.getInstance();
  
  const stats = await db.get(
    `SELECT 
      COUNT(*) as total_referrals,
      COALESCE(SUM(commission_amount), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0) as total_received,
      COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0) as total_pending
     FROM affiliate_referrals 
     WHERE affiliate_user_id = ?`,
    [affiliateUserId]
  );

  await db.run(
    'UPDATE user_affiliates SET total_referrals = ?, total_earnings = ?, total_received = ?, total_pending = ?, updated_at = ? WHERE user_id = ?',
    [stats.total_referrals, stats.total_earnings, stats.total_received, stats.total_pending, new Date().toISOString(), affiliateUserId]
  );
}

function generateAffiliateCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
}

export default router;