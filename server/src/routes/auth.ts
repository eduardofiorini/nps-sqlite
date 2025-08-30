import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const db = Database.getInstance();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO users (id, email, name, password_hash, trial_start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, name, passwordHash, now, now, now]
    );

    // Create user profile
    const profileId = uuidv4();
    await db.run(
      'INSERT INTO user_profiles (id, user_id, name, email, trial_start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [profileId, userId, name, email, now, now, now]
    );

    // Create user affiliate record
    const affiliateId = uuidv4();
    const affiliateCode = generateAffiliateCode();
    await db.run(
      'INSERT INTO user_affiliates (id, user_id, affiliate_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [affiliateId, userId, affiliateCode, now, now]
    );

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: { id: userId, email, name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = Database.getInstance();

    // Get user
    const user = await db.get(
      'SELECT id, email, name, password_hash, role, is_deactivated FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_deactivated) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    const user = await db.get(
      'SELECT id, email, name, role, phone, company, position, avatar, trial_start_date, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const db = Database.getInstance();

    // Get current user
    const user = await db.get(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [newPasswordHash, new Date().toISOString(), req.user!.id]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { confirmationEmail } = req.body;

    if (confirmationEmail !== req.user!.email) {
      return res.status(400).json({ error: 'Email confirmation does not match' });
    }

    const db = Database.getInstance();

    // Delete user (CASCADE will handle related data)
    await db.run('DELETE FROM users WHERE id = ?', [req.user!.id]);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateAffiliateCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
}

export default router;