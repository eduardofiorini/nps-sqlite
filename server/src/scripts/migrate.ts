import { Database } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    const db = Database.getInstance();

    // Create admin user
    const adminId = 'd0a6cf1d-ea8b-4dfa-95a5-8b3a2480a6ea';
    const adminEmail = 'admin@meunps.com';
    const adminPassword = 'admin123';
    const adminName = 'Administrador';
    
    // Check if admin user already exists
    const existingAdmin = await db.get('SELECT id FROM users WHERE id = ?', [adminId]);
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const now = new Date().toISOString();

      // Create admin user
      await db.run(
        'INSERT INTO users (id, email, name, password_hash, role, trial_start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminEmail, adminName, passwordHash, 'admin', now, now, now]
      );

      // Create admin profile
      const profileId = uuidv4();
      await db.run(
        'INSERT INTO user_profiles (id, user_id, name, email, trial_start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [profileId, adminId, adminName, adminEmail, now, now, now]
      );

      // Create admin permissions
      const adminPermId = uuidv4();
      await db.run(
        'INSERT INTO user_admin (id, user_id, permissions, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [adminPermId, adminId, '{"view_users": true, "view_subscriptions": true}', now, now]
      );

      // Create admin affiliate record
      const affiliateId = uuidv4();
      const affiliateCode = generateAffiliateCode();
      await db.run(
        'INSERT INTO user_affiliates (id, user_id, affiliate_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [affiliateId, adminId, affiliateCode, now, now]
      );

      console.log('✅ Admin user created successfully');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`🆔 ID: ${adminId}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function generateAffiliateCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate().then(() => {
    process.exit(0);
  });
}

export default migrate;