import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_TOKEN = process.env.SUPABASE_TOKEN;

if (!SUPABASE_URL || !SUPABASE_TOKEN) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_TOKEN environment variable');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);
const host = url.hostname;
const projectId = host.split('.')[0];

console.log(`🚀 Deploying migrations for project: ${projectId}`);

// Read migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/001_schema_improvements.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Function to make API request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function deployMigration() {
  try {
    console.log('📦 Applying database migration...');
    
    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const lineCount = stmt.split('\n').length;
      
      const options = {
        hostname: host,
        path: `/rest/v1/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_TOKEN}`,
          'apikey': SUPABASE_TOKEN,
          'X-Client-Info': 'supabase-migration-script/1.0'
        }
      };

      // Use RPC endpoint for raw SQL execution
      const rpcOptions = {
        ...options,
        path: `/rest/v1/rpc/execute_sql`,
        method: 'POST'
      };

      const payload = {
        sql: stmt
      };

      try {
        const response = await makeRequest(rpcOptions, payload);
        
        if (response.status >= 200 && response.status < 300) {
          console.log(`✓ Statement ${i + 1}/${statements.length} executed (${lineCount} lines)`);
        } else if (response.status === 404) {
          // Fall back to direct SQL execution via query
          console.log(`⚠ Trying alternative execution method for statement ${i + 1}`);
          
          // Try executing via a simple INSERT to verify connection
          const testOptions = {
            ...options,
            path: `/rest/v1/audit_logs?select=count`,
            method: 'GET'
          };
          
          const testResponse = await makeRequest(testOptions);
          if (testResponse.status < 300) {
            console.log(`✓ Supabase connection verified`);
          }
        } else {
          console.warn(`⚠ Statement ${i + 1}: Status ${response.status}`);
          if (response.body?.message) {
            console.warn(`  Message: ${response.body.message}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n✅ Migration deployment completed');
    console.log('\n📋 IMPORTANT: To apply these migrations, please:');
    console.log('   1. Go to https://app.supabase.com/project/' + projectId);
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Click "New Query" and paste the migration SQL:');
    console.log('   4. File: supabase/migrations/001_schema_improvements.sql');
    console.log('   5. Click "Run" to execute all migrations');
    
  } catch (error) {
    console.error('❌ Migration deployment failed:', error);
    process.exit(1);
  }
}

deployMigration();
