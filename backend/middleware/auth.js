const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'name', 'role', 'is_deactivated']
    });

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

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { UserAdmin } = require('../models');
    const adminUser = await UserAdmin.findOne({
      where: { user_id: req.user.id }
    });

    if (!adminUser) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const permissions = adminUser.permissions || {};
    if (!permissions.view_users) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Error checking admin status' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};