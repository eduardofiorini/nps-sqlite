import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

export class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    const dbPath = process.env.DATABASE_PATH || './data/nps.db';
    const dbDir = path.dirname(dbPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }

  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private async initializeTables() {
    try {
      // Users table (auth.users equivalent)
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          phone TEXT,
          company TEXT,
          position TEXT,
          avatar TEXT,
          is_deactivated BOOLEAN DEFAULT 0,
          trial_start_date TEXT DEFAULT CURRENT_TIMESTAMP,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Sources table
      await this.run(`
        CREATE TABLE IF NOT EXISTS sources (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Situations table
      await this.run(`
        CREATE TABLE IF NOT EXISTS situations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#10B981',
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Groups table
      await this.run(`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Campaigns table
      await this.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT,
          active BOOLEAN DEFAULT 1,
          default_source_id TEXT,
          default_group_id TEXT,
          survey_customization TEXT DEFAULT '{"backgroundType": "color", "backgroundColor": "#f8fafc", "primaryColor": "#073143", "textColor": "#1f2937"}',
          automation TEXT DEFAULT '{"enabled": false, "action": "return_only", "successMessage": "Obrigado pelo seu feedback!", "errorMessage": "Ocorreu um erro. Tente novamente."}',
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (default_source_id) REFERENCES sources(id) ON DELETE SET NULL,
          FOREIGN KEY (default_group_id) REFERENCES groups(id) ON DELETE SET NULL
        )
      `);

      // Campaign forms table
      await this.run(`
        CREATE TABLE IF NOT EXISTS campaign_forms (
          id TEXT PRIMARY KEY,
          campaign_id TEXT NOT NULL UNIQUE,
          fields TEXT NOT NULL DEFAULT '[]',
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // NPS responses table
      await this.run(`
        CREATE TABLE IF NOT EXISTS nps_responses (
          id TEXT PRIMARY KEY,
          campaign_id TEXT NOT NULL,
          score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
          feedback TEXT,
          source_id TEXT,
          situation_id TEXT,
          group_id TEXT,
          form_responses TEXT DEFAULT '{}',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
          FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
          FOREIGN KEY (situation_id) REFERENCES situations(id) ON DELETE SET NULL,
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
        )
      `);

      // Contacts table
      await this.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company TEXT,
          position TEXT,
          group_ids TEXT DEFAULT '[]',
          tags TEXT DEFAULT '[]',
          notes TEXT,
          last_contact_date TEXT,
          user_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User profiles table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          position TEXT,
          avatar TEXT,
          preferences TEXT DEFAULT '{"language": "pt-BR", "theme": "light", "emailNotifications": {"newResponses": true, "weeklyReports": true, "productUpdates": false}}',
          trial_start_date TEXT DEFAULT CURRENT_TIMESTAMP,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // App configs table
      await this.run(`
        CREATE TABLE IF NOT EXISTS app_configs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          theme_color TEXT DEFAULT '#00ac75',
          language TEXT DEFAULT 'pt-BR',
          company TEXT DEFAULT '{"name": "", "document": "", "address": "", "email": "", "phone": ""}',
          integrations TEXT DEFAULT '{"smtp": {"enabled": false, "host": "", "port": 587, "secure": false, "username": "", "password": "", "fromName": "", "fromEmail": ""}, "zenvia": {"email": {"enabled": false, "apiKey": "", "fromEmail": "", "fromName": ""}, "sms": {"enabled": false, "apiKey": "", "from": ""}, "whatsapp": {"enabled": false, "apiKey": "", "from": ""}}}',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User affiliates table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_affiliates (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          affiliate_code TEXT UNIQUE NOT NULL,
          bank_account TEXT DEFAULT '{"type": "", "bank": "", "agency": "", "account": "", "pixKey": "", "pixType": ""}',
          total_referrals INTEGER DEFAULT 0,
          total_earnings REAL DEFAULT 0,
          total_received REAL DEFAULT 0,
          total_pending REAL DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Affiliate referrals table
      await this.run(`
        CREATE TABLE IF NOT EXISTS affiliate_referrals (
          id TEXT PRIMARY KEY,
          affiliate_user_id TEXT NOT NULL,
          referred_user_id TEXT NOT NULL,
          subscription_id TEXT,
          commission_amount REAL NOT NULL DEFAULT 0,
          commission_status TEXT DEFAULT 'pending',
          paid_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (affiliate_user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User admin table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_admin (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          permissions TEXT DEFAULT '{"view_users": true, "view_subscriptions": true}',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await this.run('CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_nps_responses_campaign_id ON nps_responses(campaign_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_situations_user_id ON situations(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_user_id ON affiliate_referrals(affiliate_user_id)');

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default Database;