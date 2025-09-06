const bcrypt = require('bcryptjs');
const { sequelize, User, UserProfile, UserAdmin, UserAffiliate } = require('../models');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminId = 'd0a6cf1d-ea8b-4dfa-95a5-8b3a2480a6ea';
    const adminEmail = 'admin@meunps.com';
    const adminPassword = 'admin123';
    const adminName = 'Administrador';
    
    // Check if admin user already exists
    const existingAdmin = await User.findByPk(adminId);
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const adminUser = await User.create({
        id: adminId,
        email: adminEmail,
        name: adminName,
        password_hash: passwordHash,
        role: 'admin'
      });

      // Create admin profile
      await UserProfile.create({
        user_id: adminId,
        name: adminName,
        email: adminEmail
      });

      // Create admin permissions
      await UserAdmin.create({
        user_id: adminId,
        permissions: {
          view_users: true,
          view_subscriptions: true
        }
      });

      // Create admin affiliate record
      const affiliateCode = generateAffiliateCode();
      await UserAffiliate.create({
        user_id: adminId,
        affiliate_code: affiliateCode
      });

      console.log('✅ Admin user created successfully');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`🆔 ID: ${adminId}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

function generateAffiliateCode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return (timestamp + random).toUpperCase().substring(0, 8);
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };