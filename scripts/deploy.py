#!/usr/bin/env python3
"""
Supabase Migration Deployment Script
Executes SQL migrations to deploy schema improvements
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

def read_migration_file():
    """Read migration file and return SQL statements"""
    migration_path = Path(__file__).parent.parent / "supabase" / "migrations" / "001_schema_improvements.sql"
    
    if not migration_path.exists():
        print(f"❌ Migration file not found: {migration_path}")
        sys.exit(1)
    
    with open(migration_path, 'r') as f:
        content = f.read()
    
    return content

def get_env_variables():
    """Get required environment variables"""
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_token = os.getenv('SUPABASE_TOKEN')
    
    if not supabase_url:
        print("❌ Error: VITE_SUPABASE_URL not set")
        print("   Set with: export VITE_SUPABASE_URL='https://...supabase.co'")
        sys.exit(1)
    
    if not supabase_token:
        print("❌ Error: SUPABASE_TOKEN not set")
        print("   Set with: export SUPABASE_TOKEN='sbp_...'")
        sys.exit(1)
    
    return supabase_url, supabase_token

def extract_project_id(url):
    """Extract project ID from Supabase URL"""
    try:
        return url.split('//')[1].split('.')[0]
    except:
        return "unknown"

def execute_migration(sql_content, supabase_url, supabase_token):
    """Execute migration SQL via Supabase RPC"""
    project_id = extract_project_id(supabase_url)
    print(f"🚀 Deploying to Supabase Project: {project_id}")
    print(f"🔗 URL: {supabase_url}")
    print("")
    
    # Count SQL statements
    statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]
    print(f"📋 Found {len(statements)} SQL statements")
    print("")
    
    # Prepare headers
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {supabase_token}',
        'apikey': supabase_token,
        'X-Client-Info': 'imani-cms-migration/1.0'
    }
    
    # Try to execute via RPC if available
    print("📦 Attempting to apply migration...")
    print("")
    
    # Prepare payload
    payload = {
        'sql': sql_content
    }
    
    try:
        # Try the SQL endpoint
        url = f"{supabase_url}/rest/v1/rpc/execute_sql"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        
        try:
            response = urllib.request.urlopen(req)
            status_code = response.status
            response_data = json.loads(response.read().decode('utf-8'))
            
            if status_code >= 200 and status_code < 300:
                print("✅ Migration executed successfully!")
                print(f"   Status: {status_code}")
                return True
            else:
                print(f"⚠️  Unexpected status code: {status_code}")
                print(f"   Response: {response_data}")
                
        except urllib.error.HTTPError as e:
            error_data = e.read().decode('utf-8')
            status_code = e.code
            
            if status_code == 404:
                print("ℹ️  RPC endpoint not available (expected)")
            else:
                print(f"❌ HTTP Error {status_code}")
                print(f"   Message: {error_data}")
            
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def print_manual_instructions(project_id):
    """Print instructions for manual deployment"""
    print("\n" + "="*70)
    print("📋 MANUAL DEPLOYMENT INSTRUCTIONS")
    print("="*70)
    print("")
    print("If the automated deployment didn't work, follow these steps:")
    print("")
    print("1️⃣  Open Supabase Dashboard:")
    print(f"    https://app.supabase.com/project/{project_id}")
    print("")
    print("2️⃣  Navigate to SQL Editor (left sidebar)")
    print("")
    print("3️⃣  Click 'New Query' button")
    print("")
    print("4️⃣  Copy-paste the complete migration SQL:")
    print("    File: supabase/migrations/001_schema_improvements.sql")
    print("")
    print("5️⃣  Click 'RUN' button (or Ctrl+Enter)")
    print("")
    print("6️⃣  Wait for completion (should see ✓ marks for each operation)")
    print("")
    print("="*70)
    print("")

def main():
    """Main deployment function"""
    print("🔧 Imani CMS - Database Migration Deployer")
    print("=" * 70)
    print("")
    
    # Get configuration
    supabase_url, supabase_token = get_env_variables()
    project_id = extract_project_id(supabase_url)
    
    # Read migration
    sql_content = read_migration_file()
    print(f"✓ Loaded migration file ({len(sql_content)} bytes)")
    print("")
    
    # Execute migration
    success = execute_migration(sql_content, supabase_url, supabase_token)
    
    if not success:
        print_manual_instructions(project_id)
        print("⚠️  Automated deployment failed, but manual instructions above will work!")
        print("")
    
    print("✅ Deployment process complete!")
    print("")
    print("📝 Next steps:")
    print("   1. Verify the migration in Supabase Dashboard")
    print("   2. Check that all indexes were created")
    print("   3. Test the application with the new schema")
    print("   4. Monitor database performance")
    print("")

if __name__ == '__main__':
    main()
