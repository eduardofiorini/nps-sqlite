import express from 'express';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    const users = await db.all(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.phone,
        u.company,
        u.position,
        u.avatar,
        u.is_deactivated,
        u.trial_start_date,
        u.created_at,
        u.updated_at,
        up.preferences
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       ORDER BY u.created_at DESC`
    );

    // Parse JSON fields
    const parsedUsers = users.map(user => ({
      ...user,
      preferences: JSON.parse(user.preferences || '{}')
    }));

    res.json({ success: true, data: parsedUsers });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate user
router.post('/users/:id/deactivate', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      'UPDATE users SET is_deactivated = 1, updated_at = ? WHERE id = ?',
      [now, id]
    );

    // Deactivate all user campaigns
    await db.run(
      'UPDATE campaigns SET active = 0, updated_at = ? WHERE user_id = ?',
      [now, id]
    );

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reactivate user
router.post('/users/:id/reactivate', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      'UPDATE users SET is_deactivated = 0, updated_at = ? WHERE id = ?',
      [now, id]
    );

    res.json({ success: true, message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const db = Database.getInstance();

    // Delete user (CASCADE will handle related data)
    await db.run('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get affiliate referrals (admin only)
router.get('/affiliate/referrals', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    const referrals = await db.all(
      `SELECT 
        ar.*,
        ua.affiliate_code,
        up_affiliate.name as affiliate_name,
        up_affiliate.email as affiliate_email,
        up_referred.name as referred_name,
        up_referred.email as referred_email
       FROM affiliate_referrals ar
       LEFT JOIN user_affiliates ua ON ar.affiliate_user_id = ua.user_id
       LEFT JOIN user_profiles up_affiliate ON ar.affiliate_user_id = up_affiliate.user_id
       LEFT JOIN user_profiles up_referred ON ar.referred_user_id = up_referred.user_id
       ORDER BY ar.created_at DESC`
    );

    res.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Get admin referrals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update referral status
router.put('/affiliate/referrals/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = Database.getInstance();
    const now = new Date().toISOString();

    const updateData = [status, now];
    let sql = 'UPDATE affiliate_referrals SET commission_status = ?, updated_at = ?';

    if (status === 'paid') {
      sql += ', paid_at = ?';
      updateData.push(now);
    }

    sql += ' WHERE id = ?';
    updateData.push(id);

    await db.run(sql, updateData);

    // Update affiliate stats
    const referral = await db.get('SELECT affiliate_user_id FROM affiliate_referrals WHERE id = ?', [id]);
    if (referral) {
      await updateAffiliateStats(referral.affiliate_user_id);
    }

    res.json({ success: true, message: 'Referral status updated successfully' });
  } catch (error) {
    console.error('Update referral status error:', error);
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

export default router;