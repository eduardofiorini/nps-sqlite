import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    // Get user data
    const user = await db.get(
      'SELECT id, email, name, phone, company, position, avatar, trial_start_date, created_at, updated_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user profile
    let profile = await db.get(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [req.user!.id]
    );

    if (!profile) {
      // Create default profile
      const profileId = uuidv4();
      const now = new Date().toISOString();
      
      await db.run(
        'INSERT INTO user_profiles (id, user_id, name, email, trial_start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [profileId, user.id, user.name, user.email, user.trial_start_date, now, now]
      );

      profile = await db.get(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [req.user!.id]
      );
    }

    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      preferences: JSON.parse(profile.preferences || '{}')
    };

    res.json({ success: true, data: parsedProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      phone,
      company,
      position,
      avatar,
      preferences
    } = req.body;

    const db = Database.getInstance();
    const now = new Date().toISOString();

    // Update users table
    await db.run(
      'UPDATE users SET name = ?, phone = ?, company = ?, position = ?, avatar = ?, updated_at = ? WHERE id = ?',
      [name, phone, company, position, avatar, now, req.user!.id]
    );

    // Update user_profiles table
    await db.run(
      'UPDATE user_profiles SET name = ?, phone = ?, company = ?, position = ?, avatar = ?, preferences = ?, updated_at = ? WHERE user_id = ?',
      [name, phone, company, position, avatar, JSON.stringify(preferences || {}), now, req.user!.id]
    );

    // Get updated profile
    const profile = await db.get(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [req.user!.id]
    );

    res.json({ 
      success: true, 
      data: {
        ...profile,
        preferences: JSON.parse(profile.preferences || '{}')
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;