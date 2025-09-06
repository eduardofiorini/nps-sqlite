@@ .. @@
 const path = require('path');
 const fs = require('fs');
 
-// Load environment variables
-dotenv.config();
+// Load environment variables from server/.env
+dotenv.config({ path: path.join(__dirname, '.env') });
 
 // Validate required environment variables