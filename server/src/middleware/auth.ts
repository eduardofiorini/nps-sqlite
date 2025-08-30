import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database to ensure they still exist and are active
    const db = Database.getInstance();
    const user = await db.get(
      'SELECT id, email, name, role, is_deactivated FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.is_deactivated) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const db = Database.getInstance();
    const adminUser = await db.get(
      'SELECT permissions FROM user_admin WHERE user_id = ?',
      [req.user.id]
    );

    if (!adminUser) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const permissions = JSON.parse(adminUser.permissions);
    if (!permissions.view_users) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Error checking admin status' });
  }
};