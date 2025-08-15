@@ .. @@
 ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
 
-CREATE POLICY "Users can manage own profile"
+CREATE POLICY "Users can read own profile"
   ON user_profiles
-  FOR ALL
+  FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);
 
+CREATE POLICY "Users can insert own profile"
+  ON user_profiles
+  FOR INSERT
+  TO authenticated
+  WITH CHECK (auth.uid() = user_id);
+
+CREATE POLICY "Users can update own profile"
+  ON user_profiles
+  FOR UPDATE
+  TO authenticated
+  USING (auth.uid() = user_id)
+  WITH CHECK (auth.uid() = user_id);
+
 -- Sources table