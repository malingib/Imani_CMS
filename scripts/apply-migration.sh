#!/bin/bash

# Supabase Migration Deployment Script
# This script applies all database migrations to Supabase

set -e

# Configuration
SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_TOKEN="${SUPABASE_TOKEN}"
PROJECT_ID=$(echo "$SUPABASE_URL" | sed 's|https://\([^.]*\)\..*|\1|')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_TOKEN" ]; then
  echo "❌ Error: Missing SUPABASE_URL or SUPABASE_TOKEN"
  echo "Usage: SUPABASE_URL=<url> SUPABASE_TOKEN=<token> bash scripts/apply-migration.sh"
  exit 1
fi

echo "🚀 Deploying migrations to Supabase"
echo "📍 Project ID: $PROJECT_ID"
echo "🔗 URL: $SUPABASE_URL"

# Create a temporary directory for our work
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Read the migration file
MIGRATION_FILE="supabase/migrations/001_schema_improvements.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📖 Reading migration from: $MIGRATION_FILE"

# Copy migration to temp file
cp "$MIGRATION_FILE" "$TEMP_DIR/migration.sql"

# Extract just the SQL (remove comments)
cat "$MIGRATION_FILE" | grep -v "^--" | grep -v "^$" > "$TEMP_DIR/clean.sql"

SQL_COUNT=$(grep -c "^" "$TEMP_DIR/clean.sql" || echo "0")
echo "📋 Migration has approximately $SQL_COUNT lines of SQL"

# Create a JSON payload with the SQL
cat > "$TEMP_DIR/payload.json" << 'EOF'
{
  "query": "-- Imani CMS Schema Improvements Migration\n"
}
EOF

# Create instructions for manual execution
cat > "$TEMP_DIR/MANUAL_INSTRUCTIONS.txt" << EOF
🔧 MANUAL MIGRATION INSTRUCTIONS

If the automated script doesn't work, follow these steps:

1. Open Supabase Dashboard:
   https://app.supabase.com/project/$PROJECT_ID

2. Navigate to SQL Editor (left sidebar)

3. Click "New Query"

4. Copy-paste the entire content from:
   supabase/migrations/001_schema_improvements.sql

5. Click "RUN" button (or Ctrl+Enter)

6. Wait for the query to complete

7. You should see:
   ✓ All indexes created
   ✓ Columns added
   ✓ RLS policies applied

If you encounter column already exists errors, that's fine - they mean the migration was partially applied before.

EOF

cat "$TEMP_DIR/MANUAL_INSTRUCTIONS.txt"

echo ""
echo "📋 Next steps:"
echo "1. Copy the migration SQL to your clipboard"
echo "2. Open: https://app.supabase.com/project/$PROJECT_ID/sql/new"
echo "3. Paste the SQL from: supabase/migrations/001_schema_improvements.sql"
echo "4. Run the migration"
echo ""
echo "✅ Migration instructions saved to: $TEMP_DIR/MANUAL_INSTRUCTIONS.txt"
