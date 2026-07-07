import { Page, Route } from '@playwright/test';
import {
  MOCK_CHURCHES, MOCK_MEMBERS, MOCK_TRANSACTIONS, MOCK_EVENTS,
  MOCK_SUBSCRIPTIONS, MOCK_INVOICES, MOCK_PLATFORM_SETTINGS,
} from './mock-data';

const PROJECT_URL = 'https://rmwqkqkhdkslezoskiol.supabase.co';
const PROJECT_REF = 'rmwqkqkhdkslezoskiol';

const MOCK_SESSION = {
  access_token: 'mock_access_token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock_refresh_token',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'malingib9@gmail.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-06-01T00:00:00Z',
    app_metadata: { provider: 'email', role: 'SUPER_ADMIN' },
    user_metadata: { name: 'Malingi B', role: 'SUPER_ADMIN' },
    identities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
};

function matchUrl(path: string) {
  return (url: URL) => url.href.startsWith(`${PROJECT_URL}${path}`);
}

function json(data: any, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

function count(n: number) {
  return json([{ count: n }]);
}

/** Mock all Supabase API routes. When session=true, also inject auth session into localStorage. */
export async function mockSupabase(page: Page, { session = true } = {}) {
  if (session) {
    await page.addInitScript(`
      (() => {
        const key = 'sb-${PROJECT_REF}-auth-token';
        const s = ${JSON.stringify(MOCK_SESSION)};
        localStorage.setItem(key, JSON.stringify(s));
      })();
    `);
  }

  // Auth endpoints
  await page.route(matchUrl('/auth/v1/user'), (route: Route) =>
    route.fulfill(json(session ? MOCK_SESSION.user : { id: null })));

  await page.route(matchUrl('/auth/v1/token'), (route: Route) =>
    route.fulfill(json(session ? MOCK_SESSION : { access_token: null })));

  // REST endpoints
  await page.route(matchUrl('/rest/v1/churches'), (route: Route) => {
    const url = route.request().url();
    if (url.includes('select=count')) route.fulfill(count(MOCK_CHURCHES.length));
    else route.fulfill(json(MOCK_CHURCHES));
  });

  let currentMembers = [...MOCK_MEMBERS];
  let currentInvitations: any[] = [];

  await page.route(matchUrl('/rest/v1/members'), async (route: Route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === 'GET') {
      if (url.includes('select=count')) route.fulfill(count(currentMembers.length));
      else route.fulfill(json(currentMembers));
      return;
    }

    if (method === 'POST') {
      const body = request.postDataJSON();
      const rows = Array.isArray(body) ? body : [body];
      const inserted = rows.map((row: any) => ({
        ...row,
        id: row.id || `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      }));
      currentMembers = [...currentMembers, ...inserted];
      route.fulfill(json(inserted));
      return;
    }

    route.fulfill(json([]));
  });

  await page.route(matchUrl('/rest/v1/transactions'), (route: Route) => {
    const url = route.request().url();
    if (url.includes('select=count')) route.fulfill(count(MOCK_TRANSACTIONS.length));
    else if (url.includes('category=Income')) route.fulfill(json(MOCK_TRANSACTIONS.filter(t => t.category === 'Income')));
    else route.fulfill(json(MOCK_TRANSACTIONS));
  });

  await page.route(matchUrl('/rest/v1/church_events'), (route: Route) =>
    route.fulfill(json(MOCK_EVENTS)));

  await page.route(matchUrl('/rest/v1/subscriptions'), (route: Route) =>
    route.fulfill(json(MOCK_SUBSCRIPTIONS.map(s => ({
      ...s,
      churches: MOCK_CHURCHES.find(c => c.id === s.church_id) || null,
    })))));

  await page.route(matchUrl('/rest/v1/invoices'), (route: Route) =>
    route.fulfill(json(MOCK_INVOICES.map(i => ({
      ...i,
      churches: MOCK_CHURCHES.find(c => c.id === i.church_id) || null,
    })))));

  await page.route(matchUrl('/rest/v1/invitations'), async (route: Route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (method === 'GET') {
      route.fulfill(json(currentInvitations));
      return;
    }

    if (method === 'POST') {
      const body = request.postDataJSON();
      const rows = Array.isArray(body) ? body : [body];
      const inserted = rows.map((row: any) => ({
        ...row,
        id: row.id || `inv-${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        expires_at: row.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: row.accepted_at ?? null,
        created_at: row.created_at || new Date().toISOString(),
      }));
      currentInvitations = [...currentInvitations, ...inserted];
      route.fulfill(json(inserted));
      return;
    }

    if (method === 'DELETE') {
      const match = url.match(/id=eq\.([^&]+)/);
      if (match) {
        const id = decodeURIComponent(match[1]);
        currentInvitations = currentInvitations.filter(inv => inv.id !== id);
      }
      route.fulfill(json([]));
      return;
    }

    route.fulfill(json(currentInvitations));
  });

  await page.route(matchUrl('/rest/v1/platform_settings'), (route: Route) =>
    route.fulfill(json(MOCK_PLATFORM_SETTINGS)));

  await page.route(matchUrl('/rest/v1/audit_logs'), (route: Route) =>
    route.fulfill(json([])));

  await page.route(matchUrl('/rest/v1/groups'), (route: Route) =>
    route.fulfill(json([])));

  // Pass through static assets
  await page.route(/\.(png|jpg|jpeg|gif|svg|ico|woff2?|css)$/, (route: Route) => route.continue());
}
