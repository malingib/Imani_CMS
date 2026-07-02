# Imani CMS API Documentation

## Overview

This document describes the service layer APIs in Imani CMS, a multi-tenant church management system built with React, TypeScript, and Supabase.

---

## Core Services

### 1. Church App Data Service

**File:** `src/lib/app-data.ts`

#### Purpose
Orchestrates all data loading operations for a church, combining multiple data sources into a single church context.

#### Key Methods

##### `loadChurchAppData(churchId?: string | null): Promise<ChurchAppData>`

Loads all data for a specific church.

**Parameters:**
- `churchId` (optional): UUID of the church to load data for. If null, returns empty data.

**Returns:** Promise resolving to `ChurchAppData` object containing:
- `members: Member[]` - All active members of the church
- `transactions: Transaction[]` - All financial transactions
- `events: ChurchEvent[]` - All church events with attendance data merged
- `budgets: Budget[]` - All budget entries
- `recurringExpenses: RecurringExpense[]` - Recurring expense entries
- `communications: CommunicationLog[]` - Communication logs (SMS, Email, WhatsApp)
- `notifications: AppNotification[]` - In-app notifications
- `auditLogs: AuditLog[]` - Audit trail logs

**Example:**
```typescript
const appDataService = createChurchAppDataService(supabase);
const data = await appDataService.loadChurchAppData('church-uuid-123');
console.log(data.members.length); // Number of members
```

**Performance Notes:**
- Uses `Promise.all()` for concurrent queries (parallelized)
- Merges event attendance data from separate table
- No pagination implemented (loads all records) - may be slow for large churches
- Consider adding pagination for churches with 1000+ members

##### `createAuditLog(input: CreateAuditLogInput): Promise<AuditLog>`

Creates an audit trail entry for compliance and monitoring.

**Parameters:**
```typescript
interface CreateAuditLogInput {
  userId: string;          // User performing the action
  userName: string;        // User's display name
  action: string;          // Description of action performed
  module: AppView;         // Which module (MEMBERS, FINANCE, etc.)
  severity: 'INFO' | 'WARN' | 'CRITICAL';  // Log severity level
  churchId?: string | null; // Church context (optional for platform logs)
}
```

**Returns:** Promise resolving to the created `AuditLog` object

**Example:**
```typescript
await appDataService.createAuditLog({
  userId: 'user-123',
  userName: 'Pastor John',
  action: 'Added member Jane Doe',
  module: 'MEMBERS',
  severity: 'INFO',
  churchId: 'church-uuid-123',
});
```

**Important Notes:**
- **Server-first pattern:** Log is created on database first, then returned
- **No silent failures:** Errors are thrown (caller must handle)
- **Compliance:** Every significant action should be logged

---

### 2. Persistence Layer

**File:** `src/lib/persistence.ts`

Low-level Supabase operations for CRUD operations.

#### Member Operations

##### `createMember(member: Member, churchId: string): Promise<Member>`
Creates a new member in the database.

##### `createMembers(members: Member[], churchId: string): Promise<Member[]>`
Batch creates multiple members (for CSV import).

**Important:** Validates each record; partial success returns only valid records.

##### `updateMember(member: Member, churchId: string): Promise<Member>`
Updates an existing member.

##### `deleteMember(id: string, churchId: string): Promise<void>`
Soft or hard deletes a member (behavior depends on RLS policy).

#### Transaction Operations

##### `createTransaction(transaction: Transaction, churchId: string): Promise<Transaction>`
Records a financial transaction (tithe, offering, expense, etc.).

##### `updateTransaction(transaction: Transaction, churchId: string): Promise<Transaction>`
Updates a transaction record.

##### `deleteTransaction(id: string, churchId: string): Promise<void>`
Deletes a transaction.

#### Event Operations

##### `createEvent(event: ChurchEvent, churchId: string): Promise<ChurchEvent>`
Creates a new event.

##### `deleteEvent(id: string, churchId: string): Promise<void>`
Deletes an event.

##### `replaceEventAttendance(eventId: string, memberIds: string[], churchId: string): Promise<void>`
Replaces the attendance list for an event (all members who RSVP'd).

#### Budget Operations

##### `createBudget(budget: Budget, churchId: string): Promise<Budget>`
Creates a budget entry.

##### `updateBudget(budget: Budget, churchId: string): Promise<Budget>`
Updates a budget.

#### Other Operations

- `createCommunication()`
- `createRecurringExpense()`
- `markAllNotificationsRead()`
- `updateNotificationRead()`
- `deleteNotification()`

---

### 3. Validation Layer

**File:** `src/lib/validation.ts`

Form and data validation using Zod schemas.

#### Key Schemas

##### `MemberFormSchema`
Validates complete member data for forms.

```typescript
const validation = validateFormData(MemberFormSchema, {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+254712345678',
  email: 'john@example.com',
  location: 'Nairobi',
  // ... other fields
});

if (validation.data) {
  // Use validated data
} else {
  console.error(validation.errors);
}
```

**Validation Rules:**
- `firstName`, `lastName`: 2-100 characters
- `phone`: Matches regex `/^\+?[\d\s\-()]+$/`, 10-20 chars
- `email`: Valid email format
- `location`: Required, 1-100 chars
- `status`: One of MemberStatus enum values

##### `CsvMemberSchema`
More lenient validation for CSV bulk imports.

##### `LoginFormSchema`
Validates login credentials.

#### `validateFormData<T>()` Function

Generic validation utility.

```typescript
export const validateFormData = <T,>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T | null; errors: Record<string, string> } => {
  // Implementation handles ZodError parsing
}
```

**Returns:**
- `data`: Parsed and validated data, or null if validation failed
- `errors`: Field-level error messages keyed by field name

---

### 4. Church Context

**File:** `src/lib/church-context.tsx`

Manages multi-tenant church selection and organization context.

#### `ChurchProvider` Component

Wraps the application to provide church context.

```typescript
<ChurchProvider>
  <App />
</ChurchProvider>
```

#### `useChurch()` Hook

Access church context from any component.

```typescript
const { 
  activeChurchId,         // Currently selected church
  setActiveChurchId,      // Switch to different church
  churches,               // List of available churches
  fetchChurches          // Load churches from database
} = useChurch();
```

---

### 5. Data Context (New)

**File:** `src/lib/data-context.tsx`

Global state management for church data using React Context API.

#### `DataProvider` Component

Wraps the application to manage all data state.

```typescript
<DataProvider>
  <App />
</DataProvider>
```

#### `useData()` Hook

Access all data operations from any component.

```typescript
const {
  members,
  transactions,
  events,
  budgets,
  // ... all data collections
  
  addMember,
  updateMember,
  removeMember,
  
  setMembers,
  setTransactions,
  // ... all setter operations
  
  isLoading,
  error,
  setLoading,
  setError,
} = useData();
```

**Benefits:**
- Eliminates prop drilling
- Single source of truth for all church data
- Consistent update operations across components
- Built-in loading and error states

---

### 6. Church Data Hook (New)

**File:** `src/lib/use-church-data.ts`

Custom hook that ties together data loading and context updates.

```typescript
const { loadData } = useChurchData(churchId);
```

**Behavior:**
- Automatically loads data when `churchId` changes
- Updates all context values
- Manages loading and error states
- Can manually trigger reload with `loadData()`

**Usage:**
```typescript
const { loadData } = useChurchData(activeChurchId);

useEffect(() => {
  // Data loads automatically on mount and when churchId changes
}, []);

const handleRefresh = async () => {
  await loadData(); // Manual reload
};
```

---

## Error Handling

### Strategy

1. **Service Layer:** Throws errors with descriptive messages
2. **Component Layer:** Catches errors and displays to user via toast
3. **Audit:** Failed operations are logged (if possible)

### Example

```typescript
try {
  const saved = await createMember(member, churchId);
  addToast('Member saved successfully', 'success');
  updateMember(saved);
} catch (error: any) {
  console.error('Failed to save member:', error);
  addToast(error.message || 'Failed to save member', 'error');
}
```

---

## Security Best Practices

### Authentication

- All Supabase operations use authenticated session tokens
- User identity verified server-side via JWT claims
- Tokens auto-refresh within 60-minute window

### Authorization

- **Row-Level Security (RLS):** Database enforces that users only access their church's data
- **Client-side checks:** Additional validation for UI (defensive)
- **Server-side enforcement:** RLS policies are the source of truth

### Input Validation

- All forms validated with Zod before submission
- CSV imports sanitized and validated
- Phone numbers, emails validated per format requirements

### Data Privacy

- PII (phone, email, DOB) stored in Supabase with encryption at rest
- Photos served via signed URLs (7-day expiration)
- No sensitive data in localStorage (tokens managed by Supabase)

---

## Performance Considerations

### Current Issues

1. **All-at-once loading:** Every church login loads all members, transactions, events
   - **Impact:** Slow for churches with 1000+ members
   - **Solution:** Implement pagination or lazy loading

2. **No caching:** Data reloaded on every route change
   - **Impact:** Duplicate API calls
   - **Solution:** Add SWR or React Query for client-side cache

3. **Synchronous CSV parsing:** Blocks UI during import
   - **Impact:** UI freeze on large CSV files (1000+ rows)
   - **Solution:** Use Web Worker for background parsing

### Optimization Roadmap

- [ ] Implement pagination for large lists (default 50 items per page)
- [ ] Add React Query for automatic caching
- [ ] Move CSV parsing to Web Worker
- [ ] Virtual scrolling for member lists
- [ ] Denormalize frequently-calculated data (e.g., member giving totals)

---

## Database Schema

### Tables

#### members
- `id` (UUID, PK)
- `church_id` (UUID, FK)
- `first_name`, `last_name` (VARCHAR)
- `phone`, `email` (VARCHAR)
- `location` (VARCHAR)
- `status` (ENUM: Active, Inactive, Visitor, Youth, Deceased, Archived)
- `join_date`, `birthday` (DATE)
- `age` (INT)
- `gender` (ENUM)
- `marital_status` (ENUM)
- `membership_type` (ENUM)
- `groups` (JSONB array)
- `photo` (VARCHAR, signed URL)
- `stewardship_score` (FLOAT)
- `created_at`, `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, soft delete)

#### transactions
- `id` (UUID, PK)
- `church_id` (UUID, FK)
- `member_id` (UUID, FK, optional)
- `member_name` (VARCHAR)
- `amount` (NUMERIC)
- `type` (ENUM: Tithe, Offering, Project, etc.)
- `category` (ENUM: Income, Expense)
- `payment_method` (ENUM: M-Pesa, Cash, Bank, Cheque)
- `date` (DATE)
- `reference` (VARCHAR)
- `notes` (TEXT)
- `source` (ENUM: MANUAL, INTEGRATED)
- `created_at`, `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP)

#### church_events
- Standard event fields with attendance tracking

#### audit_logs
- Complete action trail with severity levels
- Optional metadata (JSONB)

---

## Migration Guide

See `/supabase/migrations/001_schema_improvements.sql` for database enhancements including:
- Performance indexes
- Soft delete support
- Audit trail improvements
- Member change log table

---

## Future Enhancements

- [ ] Real-time data updates with Supabase subscriptions
- [ ] Offline support with local-first sync
- [ ] Advanced search with Postgres full-text search
- [ ] Member analytics and insights
- [ ] Integration with M-Pesa for payment tracking
- [ ] SMS/Email campaign management
- [ ] Member portal mobile app
