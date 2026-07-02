#!/usr/bin/env node
/**
 * Ports Imani CMS React components to Laravel Inertia pages.
 * Run: node scripts/port-components.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcRoot = path.join(root, '..', 'components');
const pagesRoot = path.join(root, 'resources', 'js', 'pages');

const mappings = [
  ['CommunicationCenter.tsx', 'Communication/Index.tsx', 'CommunicationIndex'],
  ['GroupsManagement.tsx', 'Groups/Index.tsx', 'GroupsIndex'],
  ['ReportsCenter.tsx', 'Reports/Index.tsx', 'ReportsIndex'],
  ['DemographicsAnalysis.tsx', 'Analytics/Index.tsx', 'AnalyticsIndex'],
  ['SermonHistory.tsx', 'Sermons/Index.tsx', 'SermonsIndex'],
  ['AuditLogs.tsx', 'AuditLogs/Index.tsx', 'AuditLogsIndex'],
  ['Billing.tsx', 'Billing/Index.tsx', 'BillingIndex'],
  ['Settings.tsx', 'Settings/Index.tsx', 'SettingsIndex'],
  ['MemberPortal.tsx', 'Portal/Index.tsx', 'PortalIndex'],
  ['MyGiving.tsx', 'Giving/Index.tsx', 'GivingIndex'],
  ['PlatformDashboard.tsx', 'Platform/Index.tsx', 'PlatformIndex'],
  ['TenantsList.tsx', 'Platform/Tenants.tsx', 'TenantsPage'],
  ['InvitationsManager.tsx', 'Platform/Invitations.tsx', 'InvitationsPage'],
  ['BillingOverview.tsx', 'Platform/Billing.tsx', 'PlatformBillingPage'],
  ['PlatformSettings.tsx', 'Platform/Settings.tsx', 'PlatformSettingsPage'],
  ['PrivacyPolicy.tsx', 'Legal/Privacy.tsx', 'PrivacyPage'],
  ['CompliancePortal.tsx', 'Legal/Compliance.tsx', 'CompliancePage'],
  ['SecurityOverview.tsx', 'Legal/Security.tsx', 'SecurityPage'],
];

function transform(content, exportName) {
  let c = content;

  // Remove default export name, we'll set our own
  c = c.replace(/export default \w+;/, '');

  // Imports
  c = c.replace(/from '\.\.\/types'/g, "from '@/types'");
  c = c.replace(/from '\.\.\/services\/geminiService'/g, "from '@/lib/ai'");
  c = c.replace(/from '\.\/Sidebar'/g, "from '@/components/brand/ImaniLogoIcon'");
  c = c.replace(/from '\.\.\/src\/lib\/supabase-auth'/g, '');
  c = c.replace(/import \{ useAuth \} from '';\n/, '');

  // geminiService function renames
  c = c.replace(/generateDailyVerse\(\)/g, 'ai.dailyVerse().then(r => r.response)');
  c = c.replace(/generateShortInspirationalSermon\(/g, 'ai.inspirationalMessage(');
  c = c.replace(/getBibleScriptureAndReflection\(/g, 'ai.bibleReflection(');
  c = c.replace(/generateSermonOutline\(/g, 'ai.sermonOutline(');
  c = c.replace(/scoutOutreachLocations\(/g, 'ai.outreachScout(');
  c = c.replace(/analyzeFinances\(/g, 'ai.financeAnalysis(');

  // Add Inertia wrapper imports at top if not present
  const header = `import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types/inertia';
import { ai } from '@/lib/ai';

`;

  // Strip interface props that came from parent - pages receive via PageProps
  c = c.replace(/interface \w+Props \{[\s\S]*?\}\n\n/, '');

  // Wrap: find the main component - rename to export default function
  const componentMatch = c.match(/const (\w+): React\.FC/);
  const compName = componentMatch ? componentMatch[1] : exportName;

  if (!c.includes('AppLayout')) {
    c = c.replace(
      new RegExp(`const ${compName}: React\\.FC[^{]*\\{`),
      `interface ${exportName}Props extends PageProps {
  [key: string]: unknown;
}

export default function ${exportName}(props: ${exportName}Props) {
  const { auth, activeChurch, churches, ...pageProps } = props;
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <${compName}Inner {...pageProps} auth={auth} />
    </AppLayout>
  );
}

function ${compName}Inner(`
    );
    c = c + '\n}\n';
  }

  return header + c;
}

for (const [srcFile, destRel, exportName] of mappings) {
  const srcPath = path.join(srcRoot, srcFile);
  const destPath = path.join(pagesRoot, destRel);

  if (!fs.existsSync(srcPath)) {
    console.warn('Skip missing:', srcFile);
    continue;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const transformed = transform(raw, exportName);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, transformed);
  console.log('Ported:', destRel);
}

console.log('Done.');
