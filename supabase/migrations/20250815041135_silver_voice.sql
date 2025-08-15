@@ .. @@
 -- Sources table
 CREATE TABLE IF NOT EXISTS sources (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   description text,
   color text DEFAULT '#3B82F6',
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- Situations table
 CREATE TABLE IF NOT EXISTS situations (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   description text,
   color text DEFAULT '#10B981',
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- Groups table
 CREATE TABLE IF NOT EXISTS groups (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   description text,
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- User profiles table
 CREATE TABLE IF NOT EXISTS user_profiles (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   name text NOT NULL,
   phone text,
   company text,
@@ .. @@
 -- Contacts table
 CREATE TABLE IF NOT EXISTS contacts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   email text NOT NULL,
   phone text NOT NULL,
   company text,
   position text,
   group_ids uuid[] DEFAULT '{}',
   tags text[] DEFAULT '{}',
   notes text,
   last_contact_date timestamptz,
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- Campaigns table
 CREATE TABLE IF NOT EXISTS campaigns (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   name text NOT NULL,
   description text,
   start_date date NOT NULL,
   end_date date,
   active boolean DEFAULT true,
   default_source_id uuid REFERENCES sources(id),
   default_group_id uuid REFERENCES groups(id),
   survey_customization jsonb DEFAULT '{}',
   automation jsonb DEFAULT '{}',
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- Campaign forms table
 CREATE TABLE IF NOT EXISTS campaign_forms (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
   fields jsonb NOT NULL DEFAULT '[]',
-  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- NPS responses table
 CREATE TABLE IF NOT EXISTS nps_responses (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
   score integer NOT NULL CHECK (score >= 0 AND score <= 10),
   feedback text,
   source_id uuid REFERENCES sources(id),
   situation_id uuid REFERENCES situations(id),
   group_id uuid REFERENCES groups(id),
   form_responses jsonb DEFAULT '{}',
   created_at timestamptz DEFAULT now()
 );
@@ .. @@
 -- App configurations table
 CREATE TABLE IF NOT EXISTS app_configs (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
+  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
   theme_color text DEFAULT '#00ac75',
   language text DEFAULT 'pt-BR',
   company jsonb DEFAULT '{}',
   integrations jsonb DEFAULT '{}',
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );