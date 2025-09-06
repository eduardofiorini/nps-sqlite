const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Define models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  phone: DataTypes.STRING,
  company: DataTypes.STRING,
  position: DataTypes.STRING,
  avatar: DataTypes.TEXT,
  is_deactivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  trial_start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const Source = sequelize.define('Source', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const Situation = sequelize.define('Situation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  color: {
    type: DataTypes.STRING,
    defaultValue: '#10B981'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: DataTypes.DATEONLY,
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  default_source_id: {
    type: DataTypes.UUID,
    references: {
      model: Source,
      key: 'id'
    }
  },
  default_group_id: {
    type: DataTypes.UUID,
    references: {
      model: Group,
      key: 'id'
    }
  },
  survey_customization: {
    type: DataTypes.JSON,
    defaultValue: {
      backgroundType: 'color',
      backgroundColor: '#f8fafc',
      primaryColor: '#073143',
      textColor: '#1f2937'
    }
  },
  automation: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      action: 'return_only',
      successMessage: 'Obrigado pelo seu feedback!',
      errorMessage: 'Ocorreu um erro. Tente novamente.'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const CampaignForm = sequelize.define('CampaignForm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: Campaign,
      key: 'id'
    }
  },
  fields: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const NpsResponse = sequelize.define('NpsResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaign_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Campaign,
      key: 'id'
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 10
    }
  },
  feedback: DataTypes.TEXT,
  source_id: {
    type: DataTypes.UUID,
    references: {
      model: Source,
      key: 'id'
    }
  },
  situation_id: {
    type: DataTypes.UUID,
    references: {
      model: Situation,
      key: 'id'
    }
  },
  group_id: {
    type: DataTypes.UUID,
    references: {
      model: Group,
      key: 'id'
    }
  },
  form_responses: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  updatedAt: false
});

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: DataTypes.STRING,
  position: DataTypes.STRING,
  group_ids: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: DataTypes.TEXT,
  last_contact_date: DataTypes.DATE,
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: DataTypes.STRING,
  company: DataTypes.STRING,
  position: DataTypes.STRING,
  avatar: DataTypes.TEXT,
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      language: 'pt-BR',
      theme: 'light',
      emailNotifications: {
        newResponses: true,
        weeklyReports: true,
        productUpdates: false
      }
    }
  },
  trial_start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const AppConfig = sequelize.define('AppConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  theme_color: {
    type: DataTypes.STRING,
    defaultValue: '#00ac75'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'pt-BR'
  },
  company: {
    type: DataTypes.JSON,
    defaultValue: {
      name: '',
      document: '',
      address: '',
      email: '',
      phone: ''
    }
  },
  integrations: {
    type: DataTypes.JSON,
    defaultValue: {
      smtp: {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: '',
        fromEmail: ''
      },
      zenvia: {
        email: {
          enabled: false,
          apiKey: '',
          fromEmail: '',
          fromName: ''
        },
        sms: {
          enabled: false,
          apiKey: '',
          from: ''
        },
        whatsapp: {
          enabled: false,
          apiKey: '',
          from: ''
        }
      }
    }
  }
});

const UserAffiliate = sequelize.define('UserAffiliate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  affiliate_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  bank_account: {
    type: DataTypes.JSON,
    defaultValue: {
      type: '',
      bank: '',
      agency: '',
      account: '',
      pixKey: '',
      pixType: ''
    }
  },
  total_referrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_earnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_received: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_pending: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
});

const AffiliateReferral = sequelize.define('AffiliateReferral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  affiliate_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  referred_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  subscription_id: DataTypes.STRING,
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  commission_status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending'
  },
  paid_at: DataTypes.DATE
});

const UserAdmin = sequelize.define('UserAdmin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      view_users: true,
      view_subscriptions: true
    }
  }
});

// Define associations
function initializeModels() {
  // User associations
  User.hasMany(Source, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(Situation, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(Group, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(Campaign, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasMany(Contact, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasOne(UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasOne(AppConfig, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasOne(UserAffiliate, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  User.hasOne(UserAdmin, { foreignKey: 'user_id', onDelete: 'CASCADE' });

  // Campaign associations
  Campaign.hasMany(NpsResponse, { foreignKey: 'campaign_id', onDelete: 'CASCADE' });
  Campaign.hasOne(CampaignForm, { foreignKey: 'campaign_id', onDelete: 'CASCADE' });
  Campaign.belongsTo(Source, { foreignKey: 'default_source_id', as: 'defaultSource' });
  Campaign.belongsTo(Group, { foreignKey: 'default_group_id', as: 'defaultGroup' });

  // Response associations
  NpsResponse.belongsTo(Campaign, { foreignKey: 'campaign_id' });
  NpsResponse.belongsTo(Source, { foreignKey: 'source_id' });
  NpsResponse.belongsTo(Situation, { foreignKey: 'situation_id' });
  NpsResponse.belongsTo(Group, { foreignKey: 'group_id' });

  // Form associations
  CampaignForm.belongsTo(Campaign, { foreignKey: 'campaign_id' });

  // Affiliate associations
  AffiliateReferral.belongsTo(User, { foreignKey: 'affiliate_user_id', as: 'affiliate' });
  AffiliateReferral.belongsTo(User, { foreignKey: 'referred_user_id', as: 'referred' });

  // Reverse associations
  Source.belongsTo(User, { foreignKey: 'user_id' });
  Situation.belongsTo(User, { foreignKey: 'user_id' });
  Group.belongsTo(User, { foreignKey: 'user_id' });
  Campaign.belongsTo(User, { foreignKey: 'user_id' });
  Contact.belongsTo(User, { foreignKey: 'user_id' });
  UserProfile.belongsTo(User, { foreignKey: 'user_id' });
  AppConfig.belongsTo(User, { foreignKey: 'user_id' });
  UserAffiliate.belongsTo(User, { foreignKey: 'user_id' });
  UserAdmin.belongsTo(User, { foreignKey: 'user_id' });
}

module.exports = {
  sequelize,
  User,
  Source,
  Situation,
  Group,
  Campaign,
  CampaignForm,
  NpsResponse,
  Contact,
  UserProfile,
  AppConfig,
  UserAffiliate,
  AffiliateReferral,
  UserAdmin,
  initializeModels
};