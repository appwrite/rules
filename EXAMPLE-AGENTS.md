# Appwrite Development Rules

> You are an expert developer focused on building apps with Appwrite's JavaScript/TypeScript SDK.

## Overview

This file provides AI coding assistants with Appwrite-specific development instructions, best practices, and code patterns for the JavaScript/TypeScript SDK with nextjs.

## SDK Installation

Install the Appwrite Node.js Server SDK using npm:

```bash
npm install node-appwrite
```

You can also use yarn, pnpm, or bun instead.

**Framework Documentation:**
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/nextjs)

**API References:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Account API](https://appwrite.io/docs/references/cloud/server-nodejs/account) - Session management and account operations
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations and queries
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File upload, download, and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications

**SSR Authentication Pattern:**

Server-side rendering requires using the Server SDK instead of the client SDK.

**Authentication Flow:**
1. User credentials are sent from browser to your server
2. Your server authenticates with Appwrite using the Server SDK
3. Appwrite returns a session object
4. Store the session secret in an httpOnly cookie
5. Subsequent requests include the session cookie
6. Your server makes authenticated requests on behalf of the user

**Key Implementation Details:**

**Initialize Two Clients:**
- **Admin Client**: Uses API key for unauthenticated requests and session creation
- **Session Client**: Uses session cookie for user-specific requests

**Best Practices:**
- Use httpOnly, secure, and sameSite cookie flags
- Create new session client per request
- Never share clients between requests
- Use API key for admin client to bypass rate limits
- Set forwarded user agent for better session tracking

**See full SSR auth guide:** https://appwrite.io/docs/products/auth/server-side-rendering

**Creating Sessions:**
```javascript
import { Client, Account } from "node-appwrite";

// In your login endpoint:
const account = new Account(adminClient);
const session = await account.createEmailPasswordSession(email, password);

// Set httpOnly cookie with session secret
res.cookie('a_session_<PROJECT_ID>', session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(session.expire),
    path: '/'
});
```

**Making Authenticated Requests:**
```javascript
// Read session from cookie
const session = req.cookies['a_session_<PROJECT_ID>'];

// Create session client
const sessionClient = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setSession(session);

const account = new Account(sessionClient);
const user = await account.get();
```

**OAuth2 Flow:**
1. Redirect to OAuth provider using createOAuth2Token
2. Handle callback with userId and secret parameters
3. Call createSession to exchange for session object
4. Store session secret in cookie


## 🚨 Absolute Rules (Non-Negotiable)

### Authoritative Access Pattern

- **NEVER** import or invoke the Appwrite SDK directly from feature/component code
- **ALWAYS** use centralized wrapper functions for all data access
- **ALWAYS** authenticate before any data operation
- **NEVER** expose API keys to client-side code

---

## Error Handling

- Let errors bubble by default for consistent error handling
- Catch only when adding context or performing cleanup
- Always rethrow with clear error messages
- Never swallow errors silently

---

## Type Safety

- Avoid untyped/dynamic types where possible
- Define models/interfaces/structs for all data structures
- Use your language's type system to enforce constraints
- Validate inputs with appropriate validation libraries for your language



## Next.js Server Action Pattern

### Mandatory Structure (App Router)

Every server action must:
1. Be marked with `'use server'`
2. Authenticate immediately
3. Validate input
4. Use centralized db/storage helpers only
5. Return plain serializable objects

### Canonical Example

```typescript
// app/actions/items.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function createItem(formData: FormData) {
  // 1. Authenticate first
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // 2. Validate input
  const title = formData.get('title')?.toString()
  const teamId = formData.get('teamId')?.toString()
  
  if (!title || title.length === 0 || title.length > 120) {
    throw new Error('Invalid title')
  }

  // 3. Use centralized db helper
  const item = await db.items.create({
    title: title.trim(),
    description: null,
    createdBy: session.user.id,
    teamId: teamId ?? null,
  })

  // 4. Revalidate and return
  revalidatePath('/items')
  return { item }
}
```

### Route Handler Pattern

```typescript
// app/api/items/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await db.items.listByOwner(session.user.id)
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const item = await db.items.create({
    ...body,
    createdBy: session.user.id,
  })

  return NextResponse.json({ item }, { status: 201 })
}
```

### Server Component Data Fetching

```typescript
// app/items/page.tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function ItemsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const items = await db.items.listByOwner(session.user.id)
  
  return <ItemsList items={items} />
}
```

### Environment Variables

Required in `.env.local`:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_BUCKET_ID` (if using storage)



## Database Implementation Rules

### Database Wrapper Requirements

Create centralized database helpers that:
- Configure the admin client with proper credentials
- Handle project, database, and table IDs
- Manage permissions automatically
- Return typed/structured objects (never raw Appwrite rows)

- **NEVER** use TablesDB SDK directly for app data
- **ALWAYS** use centralized wrapper functions for database access

---

## Ownership Enforcement (Critical)

### User-Owned Entities (`createdBy`)

Every user-owned table must include a `createdBy` column.

| Operation | Rule |
|-----------|------|
| **Create** | Set `createdBy` to authenticated user's `$id` |
| **List** | Filter with `Query.equal('createdBy', [userId])` |
| **Read** | Verify ownership before returning data |
| **Update** | Confirm ownership; NEVER allow `createdBy` to change |
| **Delete** | Confirm ownership before deletion |

### Team-Owned Entities (`teamId`)

For shared workspaces and organization data:

| Operation | Rule |
|-----------|------|
| **Create** | Set `teamId`; verify user is team member |
| **List** | Filter with `Query.equal('teamId', [teamId])` |
| **Read** | Verify team match AND user membership |
| **Update** | Confirm membership; NEVER allow `teamId` to change |
| **Delete** | Confirm membership before deletion |

---

## Database Usage Rules

- Import database helpers from centralized location only
- Operate on **tables**, expect **rows**
- Create payloads: exclude system columns (`$id`, `$createdAt`, `$updatedAt`)
- Update payloads: partial data, exclude system and ownership columns
- NEVER modify: `$id`, `$createdAt`, `$updatedAt`, `createdBy`, `teamId`
- Use `Query.equal()` for ownership filtering
- Return serialized/structured objects only (no raw SDK responses)

---

## Sanitization & Payload Rules

- Trim all user-provided strings
- Convert empty optional text to `null` (or language equivalent)
- Creates: require full payload (minus system fields)
- Updates: accept partial payload
- Ownership fields (`createdBy`, `teamId`) are IMMUTABLE after creation



## Database Wrapper Template

Create a centralized database helper at your designated location (e.g., `lib/db.ts` or `server/lib/db.ts`):

```typescript
import { Client, TablesDB, Query, ID } from 'node-appwrite'

// Initialize admin client (server-side only)
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const tablesDB = new TablesDB(client)
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!

// Generic CRUD helper factory
function createTable<T>(tableId: string) {
  return {
    async create(data: Omit<T, '$id' | '$createdAt' | '$updatedAt'>) {
      const doc = await tablesDB.createRow(
        DATABASE_ID,
        tableId,
        ID.unique(),
        data
      )
      return doc as T
    },

    async get(id: string) {
      try {
        const doc = await tablesDB.getRow(DATABASE_ID, tableId, id)
        return doc as T
      } catch {
        return null
      }
    },

    async listByOwner(userId: string) {
      const response = await tablesDB.listRows(DATABASE_ID, tableId, [
        Query.equal('createdBy', [userId]),
        Query.orderDesc('$createdAt'),
      ])
      return response.rows as T[]
    },

    async listByTeam(teamId: string) {
      const response = await tablesDB.listRows(DATABASE_ID, tableId, [
        Query.equal('teamId', [teamId]),
        Query.orderDesc('$createdAt'),
      ])
      return response.rows as T[]
    },

    async update(id: string, data: Partial<T>) {
      // Remove immutable columns
      const { $id, $createdAt, $updatedAt, createdBy, teamId, ...updateData } = data as any
      const doc = await tablesDB.updateRow(DATABASE_ID, tableId, id, updateData)
      return doc as T
    },

    async delete(id: string) {
      await tablesDB.deleteRow(DATABASE_ID, tableId, id)
    },
  }
}

// Export typed tables
export const db = {
  items: createTable<Item>('items'),
  projects: createTable<Project>('projects'),
  // Add more tables as needed
}
```



## Storage Implementation Rules

### Storage Wrapper Requirements

Create centralized storage helpers that:
- Initialize storage with proper bucket configuration
- Handle file upload/download conversions
- Manage file permissions
- Return only file IDs or data URLs (never raw binary data to client)

- **NEVER** use Storage SDK directly for app data
- **ALWAYS** use centralized wrapper functions for storage access

---

## Storage Usage Rules

### Upload Flow (Mandatory Conversion)

```
Client → Server: base64 string (or file bytes)
Server: Decode base64 → bytes/buffer → InputFile
Server → Storage: InputFile
Storage → Server: File metadata
Server → Client: file ID only
```

Rules:
- Strip `data:...;base64,` prefix before processing
- Decode base64 to bytes using your language's standard library
- Use the SDK's InputFile helper for uploads
- NEVER store base64 strings in database
- Store **file IDs only** in database fields

### Read Flow

```
Server: Fetch file from storage (binary/bytes)
Server: Convert bytes → base64 → data URL
Server → Client: data URL string (or secure download URL)
```

- NEVER expose raw binary data to client
- Always return URL strings or base64 data URLs

---

## File References in Rows

- Store file references as string arrays (`fileIds` field)
- On row load, fetch file URLs and inject into response
- Handle missing files gracefully
- Implement orphaned file cleanup when rows are deleted



## Storage Wrapper Template

Create a centralized storage helper:

```typescript
import { Client, Storage, ID } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const storage = new Storage(client)
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!

export const fileStorage = {
  /**
   * Upload file from base64 string
   * @returns File ID only (never store base64 in database)
   */
  async upload(base64Data: string, fileName: string, mimeType: string) {
    // Strip data URL prefix if present
    const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '')
    
    // Convert to buffer
    const buffer = Buffer.from(base64Clean, 'base64')
    
    // Create InputFile
    const inputFile = InputFile.fromBuffer(buffer, fileName)
    
    // Upload to storage
    const file = await storage.createFile(BUCKET_ID, ID.unique(), inputFile)
    
    return file.$id // Return ID only
  },

  /**
   * Get file as data URL for client consumption
   */
  async getAsDataUrl(fileId: string, mimeType: string) {
    const arrayBuffer = await storage.getFileDownload(BUCKET_ID, fileId)
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return `data:${mimeType};base64,${base64}`
  },

  /**
   * Get file preview URL
   */
  getPreviewUrl(fileId: string, width?: number, height?: number) {
    return storage.getFilePreview(BUCKET_ID, fileId, width, height)
  },

  /**
   * Delete file
   */
  async delete(fileId: string) {
    await storage.deleteFile(BUCKET_ID, fileId)
  },

  /**
   * Delete multiple files (for cleanup)
   */
  async deleteMany(fileIds: string[]) {
    await Promise.allSettled(
      fileIds.map(id => storage.deleteFile(BUCKET_ID, id))
    )
  },
}
```



## Functions Integration Pattern

**Documentation:** [Functions Quick Start](https://appwrite.io/docs/products/functions/quick-start)

### When to Use Appwrite Functions

- **Scheduled tasks**: Cron jobs, periodic cleanup, report generation
- **Event-driven processing**: Triggered by database changes, file uploads, user events
- **Background jobs**: Long-running operations, email sending, data processing
- **Webhooks**: Third-party integrations, payment processing
- **Server-side logic**: Operations requiring elevated permissions

### Execution Patterns

| Pattern | Use Case | Method |
|---------|----------|--------|
| **Synchronous** | Immediate response needed | `createExecution(functionId, body, async=false)` |
| **Asynchronous** | Fire-and-forget, long tasks | `createExecution(functionId, body, async=true)` |
| **Scheduled** | Cron-based triggers | Configure in Console/appwrite.json |
| **Event-driven** | Database/storage triggers | Configure event subscriptions |

### Implementation Steps

1. **Initialize Functions service** with your SDK's client
2. **Call `createExecution()`** with:
   - `functionId`: The function's unique ID
   - `body`: JSON string of data to pass
   - `async`: Boolean for sync/async execution
   - `path`: Optional route path (default: "/")
   - `method`: HTTP method (GET, POST, etc.)
3. **Handle response**: Check `status` field for success/failure
4. **Parse `responseBody`** as JSON for the result

### Function Development Best Practices

- Use [Appwrite Function Templates](https://github.com/appwrite/templates) as starting points
- Store secrets in function environment variables, not in code
- Return JSON responses for easy parsing
- Implement proper error handling and logging
- Use typed request/response structures for your language

### Resources

- [Develop Functions](https://appwrite.io/docs/products/functions/develop)
- [Execute Functions](https://appwrite.io/docs/products/functions/execute)
- [Function Runtimes](https://appwrite.io/docs/products/functions/runtimes)
- [Event Triggers](https://appwrite.io/docs/advanced/platform/events)



## Messaging Integration Pattern

**Documentation:** [Messaging Overview](https://appwrite.io/docs/products/messaging)

### Message Types

| Type | Method | Use Case |
|------|--------|----------|
| **Email** | `createEmail()` | Transactional emails, notifications |
| **Push** | `createPush()` | Mobile/web push notifications |
| **SMS** | `createSms()` | Text messages, verification codes |

### Targeting Options

Messages can be sent to:
- **Users**: Array of user IDs (`users` parameter)
- **Targets**: Specific device/endpoint IDs (`targets` parameter)
- **Topics**: Broadcast to subscribers (`topics` parameter)

### Implementation Steps

1. **Initialize Messaging service** with your SDK's client (requires API key)
2. **Create message** using the appropriate method:
   - `createEmail(messageId, subject, content, topics, users, targets, ...)`
   - `createPush(messageId, title, body, topics, users, targets, data)`
   - `createSms(messageId, content, topics, users, targets)`
3. **Handle delivery status** by checking the returned message object

### Topic Subscriptions

- **Subscribe**: `createSubscriber(topicId, subscriberId, targetId)`
- **Unsubscribe**: `deleteSubscriber(topicId, subscriberId)`

### Provider Configuration Required

| Channel | Providers |
|---------|-----------|
| **Email** | SMTP, Mailgun, SendGrid, Mailchimp |
| **Push** | FCM (Android), APNS (iOS) |
| **SMS** | Twilio, Vonage, Textmagic, Telesign |

Configure providers in Appwrite Console → Messaging → Providers

### Best Practices

- Generate unique message IDs for each send
- Handle message failures gracefully
- Use topics for broadcast messages, targets for specific devices
- Store provider credentials securely in Console
- Implement retry logic for failed deliveries

### Resources

- [Send Email](https://appwrite.io/docs/products/messaging/send-email-messages)
- [Send Push](https://appwrite.io/docs/products/messaging/send-push-notifications)
- [Send SMS](https://appwrite.io/docs/products/messaging/send-sms-messages)
- [Topics](https://appwrite.io/docs/products/messaging/topics)



## Realtime Integration Pattern

**Documentation:** [Realtime Overview](https://appwrite.io/docs/products/realtime)

### Overview

Realtime subscriptions allow your app to receive live updates when data changes. Subscriptions run on the **client side** using the client SDK.

### Subscription Flow

1. **Initialize client** with endpoint and project ID
2. **Subscribe to channel(s)** using `client.subscribe(channels, callback)`
3. **Handle events** in the callback (create, update, delete)
4. **Unsubscribe** when component unmounts or no longer needed

### Realtime Channels Reference

| Channel Pattern | Description |
|-----------------|-------------|
| `databases.[DB_ID].tables.[TABLE_ID].rows` | All rows in table |
| `databases.[DB_ID].tables.[TABLE_ID].rows.[ROW_ID]` | Specific row |
| `buckets.[BUCKET_ID].files` | All files in bucket |
| `buckets.[BUCKET_ID].files.[FILE_ID]` | Specific file |
| `account` | Current user's account changes |
| `teams` | Team membership changes |
| `teams.[TEAM_ID]` | Specific team changes |

### Event Types

The callback receives an event object with:
- `events`: Array of event strings (e.g., `databases.*.tables.*.rows.*.create`)
- `payload`: The row/file/account data that changed

| Event | Triggered When |
|-------|----------------|
| `*.create` | New row/file created |
| `*.update` | Existing row/file updated |
| `*.delete` | Row/file deleted |

### Implementation Pattern

```
// Pseudocode for any SDK
subscription = client.subscribe(
  ["databases.DB_ID.tables.TABLE_ID.rows"],
  function(event) {
    if event.type contains "create":
      add event.payload to local state
    else if event.type contains "update":
      update matching item in local state
    else if event.type contains "delete":
      remove matching item from local state
  }
)

// On cleanup/unmount:
subscription.close()  // or unsubscribe()
```

### Best Practices

- **Always unsubscribe** in cleanup/dispose functions
- Use **client SDK** for realtime (not server SDK)
- Filter events client-side if you only need specific event types
- Implement **reconnection logic** for dropped connections
- Consider **optimistic updates** combined with realtime for better UX
- Use **initial data from server** then enhance with realtime updates
- Handle the case where connection drops and reconnects

### Resources

- [Subscribe to Databases](https://appwrite.io/docs/products/realtime/subscribe-to-databases)
- [Subscribe to Storage](https://appwrite.io/docs/products/realtime/subscribe-to-storage)
- [Subscribe to Account](https://appwrite.io/docs/products/realtime/subscribe-to-account)
- [Channels Reference](https://appwrite.io/docs/products/realtime/channels)



## Sites Deployment Pattern

Appwrite Sites is a hosting platform for static and SSR applications. Configuration is primarily done through the Appwrite Console or CLI.

### Deployment Methods

1. **Git Integration** (Recommended)
   - Connect your repository in Appwrite Console
   - Automatic deployments on push to configured branch
   - See: [Deploy from Git](https://appwrite.io/docs/products/sites/deploy-from-git)

2. **CLI Deployment**
   - Use `appwrite deploy` command
   - See: [Deploy from CLI](https://appwrite.io/docs/products/sites/deploy-from-cli)

3. **Manual Upload**
   - Upload built assets directly
   - See: [Deploy Manually](https://appwrite.io/docs/products/sites/deploy-manually)

### Environment Variables

Configure in Appwrite Console under Site settings:
- `APPWRITE_ENDPOINT` - Your Appwrite endpoint
- `APPWRITE_PROJECT_ID` - Your project ID
- Build-time vs runtime variables as needed

### Framework-Specific Notes

- **Static Sites**: Build output uploaded as-is
- **SSR Apps**: Require Appwrite Functions runtime
- Check [Frameworks Documentation](https://appwrite.io/docs/products/sites/frameworks) for your specific framework

### Rollbacks

Appwrite Sites supports instant rollbacks:
- View deployment history in Console
- Click "Activate" on any previous deployment
- See: [Instant Rollbacks](https://appwrite.io/docs/products/sites/instant-rollbacks)


## Next.js-Specific Best Practices

### Rendering Strategy
- Default to Server Components for all data fetching
- Use `'use server'` for all mutation functions
- Only use Client Components when explicitly needed for interactivity
- Never import Appwrite SDK in Client Components

### Data Fetching Pattern
```typescript
// In Server Component - direct async/await
async function ItemsPage() {
  const items = await db.items.listByOwner(userId)
  return <ItemsList items={items} />
}
```

### Revalidation
```typescript
// After mutations, revalidate the path
import { revalidatePath } from 'next/cache'

export async function createItem(data) {
  'use server'
  const item = await db.items.create(data)
  revalidatePath('/items')
  return { item }
}
```

### File Organization
```
app/
├── actions/           # Server Actions
│   └── items.ts
├── lib/
│   ├── db.ts         # Database wrapper (server-only)
│   ├── storage.ts    # Storage wrapper (server-only)
│   └── auth.ts       # Auth helpers
└── (routes)/
    └── items/
        └── page.tsx  # Server Component
```

## Authentication & Teams

**Authentication Documentation:**

- [Authentication Quick Start](https://appwrite.io/docs/products/auth/quick-start) - Getting started with authentication
- [Email & Password](https://appwrite.io/docs/products/auth/email-password) - Email/password authentication
- [OAuth2 Providers](https://appwrite.io/docs/products/auth/oauth2) - Social authentication (Google, GitHub, etc.)
- [Magic URL](https://appwrite.io/docs/products/auth/magic-url) - Passwordless authentication via email
- [Phone (SMS)](https://appwrite.io/docs/products/auth/phone-sms) - Phone number authentication
- [Anonymous Sessions](https://appwrite.io/docs/products/auth/anonymous) - Guest/anonymous users
- [JWT Tokens](https://appwrite.io/docs/products/auth/jwt) - JSON Web Token authentication
- [MFA/2FA](https://appwrite.io/docs/products/auth/mfa) - Multi-factor authentication
- [SSR Authentication](https://appwrite.io/docs/products/auth/server-side-rendering) - Server-side rendering auth patterns
- [Teams](https://appwrite.io/docs/products/auth/teams) - Team management and team-based permissions
- [Team Invites](https://appwrite.io/docs/products/auth/team-invites) - Inviting members to teams
- [Multi-tenancy](https://appwrite.io/docs/products/auth/multi-tenancy) - Building multi-tenant applications with teams

### Best Practices for Authentication & Teams

- **Session Security**: Always use HttpOnly cookies for session storage in SSR applications
- **API Keys**: Never expose API keys to client-side code - use environment variables
- **Session Validation**: Always validate sessions on the server before trusting them
- **Team-Based Architecture**: ALWAYS prefer team/member-based roles over user-specific roles for any application requiring shared access or multi-tenancy
- **Multi-Tenant Applications**: Use teams as the primary mechanism for tenant isolation and resource sharing
- **OAuth Redirects**: Handle OAuth redirects properly with success and failure URLs
- **Password Security**: Use strong password requirements and consider implementing MFA
- **Session Expiry**: Configure appropriate session expiry times based on your security requirements

### Team & Member Management Fundamentals

When building applications that involve multiple users or tenants:

1. **Always Start with Teams**: For any feature requiring shared access, create a team first, then add members with roles
2. **Role-Based Access**: Assign roles (e.g., "owner", "admin", "member", "viewer") to team members rather than setting individual user permissions
3. **Team Isolation**: Use teams as the boundary for data isolation in multi-tenant applications
4. **Member Invitations**: Implement team invitation workflows for onboarding new members
5. **Role Management**: Build role management UIs that allow team owners/admins to manage member roles dynamically

## Permissions & Multi-Tenancy

This section is CRITICAL for building secure, scalable applications with Appwrite. Multi-tenancy is one of the most important architectural patterns in modern applications, and Appwrite's team-based permission system is designed specifically for this.

**Permissions Documentation:**

- [Permissions Overview](https://appwrite.io/docs/advanced/platform/permissions) - Understanding Appwrite's permission system
- [Role Types](https://appwrite.io/docs/advanced/platform/permissions#role-types) - Available permission roles (any, users, guests, team, member, label)
- [Permission Types](https://appwrite.io/docs/advanced/platform/permissions#permission-types) - Read, create, update, delete permissions
- [Teams](https://appwrite.io/docs/products/auth/teams) - Team-based access control
- [Multi-tenancy](https://appwrite.io/docs/products/auth/multi-tenancy) - Tenant isolation patterns

### Why Multi-Tenancy Matters

Multi-tenancy allows a single application instance to serve multiple isolated groups of users (tenants) while maintaining complete data isolation and security. Almost every modern SaaS application requires multi-tenancy to scale efficiently.

### The Critical Pattern: Team-Based Permissions

**ALWAYS PREFER TEAM/MEMBER-BASED ROLES over user-specific roles.** This is a fundamental architectural decision:

#### Avoid: User-Specific Permissions
```javascript
// DON'T: User-specific permissions don't scale
Permission.read(Role.user('<USER_ID>'))
Permission.write(Role.user('<USER_ID>'))
```

**Problems with user-specific permissions:**
- Hard to scale when users need to share resources
- Difficult to add/remove access without updating every row
- No way to represent organizational hierarchies
- Poor support for collaborative features

#### Prefer: Team/Member-Based Roles
```javascript
// DO: Team-based permissions scale with your organization
Permission.read(Role.team('<TEAM_ID>', 'member'))
Permission.update(Role.team('<TEAM_ID>', 'admin'))
Permission.delete(Role.team('<TEAM_ID>', 'owner'))
```

**Benefits of team/member-based roles:**
- Automatic access for all team members based on their role
- Easy to add/remove members without touching rows
- Scales naturally as teams grow
- Supports organizational hierarchies and complex permissions

### Query Isolation Pattern

**CRITICAL**: Always filter queries by `teamId` to ensure tenant isolation:

```javascript
// ALWAYS filter by teamId for tenant isolation
const response = await tablesDB.listRows(
  '<DATABASE_ID>',
  '<TABLE_ID>',
  [
    Query.equal('teamId', '<TEAM_ID>'),  // Critical for isolation
    Query.orderDesc('$createdAt'),
    Query.limit(25)
  ]
);
```

### Role Verification Pattern

Before allowing sensitive operations, always verify the user's role:

```javascript
// Verify permissions before sensitive operations
const memberships = await teams.listMemberships('<TEAM_ID>');
const membership = memberships.memberships.find(m => m.userId === userId);

if (!membership?.roles.includes('admin')) {
  throw new Error('Insufficient permissions');
}
```

### Multi-Tenancy Implementation Guide

#### Step 1: Create Teams Structure

Teams in Appwrite represent tenants. Each team should map to a business entity (company, organization, workspace).

See: [Teams Documentation](https://appwrite.io/docs/products/auth/teams)

#### Step 2: Define Custom Roles

Common role hierarchy:
- **owner**: Full control, can manage team settings and members
- **admin**: Can manage resources and most settings
- **member**: Can create/edit resources with limited permissions
- **viewer**: Read-only access

#### Step 3: Member Management

For team invitations and membership management, see [Team Invites Guide](https://appwrite.io/docs/products/auth/team-invites)

#### Step 4: Apply Permissions Consistently

Use team roles for all resources:
- **Database rows**: Apply `Role.team('<TEAM_ID>', 'role')` permissions
- **Storage files**: Same team-based permission pattern
- **Always include `teamId`** as a field in your rows for query filtering

### Permission Best Practices

1. **Always Store teamId**: Every row in a multi-tenant app should have a `teamId` field
2. **Default Deny**: Don't grant permissions unless explicitly needed
3. **Role Hierarchy**: Design roles to reflect natural hierarchies (owner > admin > member > viewer)
4. **Server-Side Validation**: Always validate team membership server-side
5. **Query Isolation**: Every multi-tenant query MUST include a `teamId` filter

### Common Multi-Tenancy Patterns

| Pattern | Example Apps | Structure |
|---------|--------------|-----------|
| Workspace-Based | Notion, Slack | Each workspace = 1 team, users can belong to multiple teams |
| Organization-Based | GitHub, GitLab | Each org = 1 team, resources scoped to org |
| Project-Based | Linear, Asana | Each project = 1 team, members invited per project |

### Debugging Permission Issues

1. **Check Team Membership**: Verify user is actually a member of the team
2. **Verify Roles**: Check `membership.roles` contains the required role
3. **Check Permission Strings**: Permission strings are case-sensitive
4. **Query Filters**: Ensure `teamId` filters are applied correctly
5. **Server vs Client**: Some operations require the Server SDK

### Additional Resources

**Authentication Documentation:**

- [Authentication Quick Start](https://appwrite.io/docs/products/auth/quick-start) - Getting started with authentication
- [Email & Password](https://appwrite.io/docs/products/auth/email-password) - Email/password authentication
- [OAuth2 Providers](https://appwrite.io/docs/products/auth/oauth2) - Social authentication (Google, GitHub, etc.)
- [Magic URL](https://appwrite.io/docs/products/auth/magic-url) - Passwordless authentication via email
- [Phone (SMS)](https://appwrite.io/docs/products/auth/phone-sms) - Phone number authentication
- [Anonymous Sessions](https://appwrite.io/docs/products/auth/anonymous) - Guest/anonymous users
- [JWT Tokens](https://appwrite.io/docs/products/auth/jwt) - JSON Web Token authentication
- [MFA/2FA](https://appwrite.io/docs/products/auth/mfa) - Multi-factor authentication
- [SSR Authentication](https://appwrite.io/docs/products/auth/server-side-rendering) - Server-side rendering auth patterns
- [Teams](https://appwrite.io/docs/products/auth/teams) - Team management and team-based permissions
- [Team Invites](https://appwrite.io/docs/products/auth/team-invites) - Inviting members to teams
- [Multi-tenancy](https://appwrite.io/docs/products/auth/multi-tenancy) - Building multi-tenant applications with teams

## Database Operations

**Database Documentation:**

- [Database Quick Start](https://appwrite.io/docs/products/databases/quick-start) - Getting started with TablesDB
- [Tables](https://appwrite.io/docs/products/databases/tables) - Creating and managing tables
- [Rows](https://appwrite.io/docs/products/databases/rows) - CRUD operations on rows
- [Queries](https://appwrite.io/docs/products/databases/queries) - Filtering, sorting, and querying data
- [Pagination](https://appwrite.io/docs/products/databases/pagination) - Paginating large datasets
- [Relationships](https://appwrite.io/docs/products/databases/relationships) - One-to-one, one-to-many, many-to-many relationships
- [Permissions](https://appwrite.io/docs/products/databases/permissions) - Row and table-level permissions
- [Transactions](https://appwrite.io/docs/products/databases/transactions) - Atomic operations

### Database Setup Scripts

**ALWAYS create a database setup script using the Server SDK and API key** to initialize your database schema. This script should be version-controlled and run during deployment or initial setup.

**Why Use Setup Scripts:**
- **Infrastructure as Code**: Database schema becomes part of your codebase, not manual console clicks
- **Reproducibility**: Easy to recreate database structure across different environments (dev, staging, production)
- **Version Control**: Track schema changes over time with Git
- **Team Collaboration**: All developers can sync database structure automatically
- **CI/CD Integration**: Automate database setup in deployment pipelines
- **Documentation**: The script serves as living documentation of your database structure

**What Your Setup Script Should Include:**

1. **Table Creation**: All tables with proper naming and IDs
2. **Column Definitions**: All columns with correct data types (string, integer, boolean, datetime, email, url, etc.)
3. **Indexes**: Performance-critical indexes on frequently queried fields (especially `teamId`, foreign keys, search fields)
4. **Relationships**: All table relationships and foreign key constraints
5. **Default Permissions**: Table-level permissions using team roles
6. **Column Constraints**: Required fields, string lengths, number ranges, enum values, default values

**Setup Script Requirements:**

- **Use Server SDK**: Must use the Server SDK (node-appwrite, appwrite/appwrite for PHP, etc.), NOT the client SDK
- **Require API Key**: The script must use an API key with appropriate scopes (`databases.write`, `tables.write`, `columns.write`)
- **Idempotent**: Script should safely handle re-runs (check if tables exist before creating)
- **Environment Variables**: Store API key, endpoint, project ID, and database ID in environment variables
- **Error Handling**: Proper error handling with clear error messages
- **Logging**: Log progress and errors for debugging

**Example Setup Script Structure:**

```javascript
// scripts/setup-database.js (Node.js example)
import { Client, TablesDB, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

async function setupDatabase() {
    try {
        // Create Users table
        await tablesDB.createTable(databaseId, 'users', 'Users', [
            Permission.read(Role.users()),
            Permission.write(Role.users())
        ]);
        
        // Add columns to Users table
        await tablesDB.createStringColumn(databaseId, 'users', 'name', 255, true);
        await tablesDB.createEmailColumn(databaseId, 'users', 'email', true);
        await tablesDB.createStringColumn(databaseId, 'users', 'teamId', 255, true);
        
        // Create index on teamId for query performance
        await tablesDB.createIndex(databaseId, 'users', 'idx_team', 'key', ['teamId']);
        
        // Create Projects table with team-based permissions
        await tablesDB.createTable(databaseId, 'projects', 'Projects', [
            Permission.read(Role.team('[TEAM_ID]')),
            Permission.create(Role.team('[TEAM_ID]', 'member')),
            Permission.update(Role.team('[TEAM_ID]', 'admin')),
            Permission.delete(Role.team('[TEAM_ID]', 'owner')),
        ]);
        
        // Add columns to Projects table
        await tablesDB.createStringColumn(databaseId, 'projects', 'name', 255, true);
        await tablesDB.createStringColumn(databaseId, 'projects', 'description', 5000, false);
        await tablesDB.createStringColumn(databaseId, 'projects', 'teamId', 255, true);
        await tablesDB.createStringColumn(databaseId, 'projects', 'ownerId', 255, true);
        await tablesDB.createDatetimeColumn(databaseId, 'projects', 'createdAt', true);
        
        // Create indexes
        await tablesDB.createIndex(databaseId, 'projects', 'idx_team', 'key', ['teamId']);
        await tablesDB.createIndex(databaseId, 'projects', 'idx_owner', 'key', ['ownerId']);
        
        // Create relationship between projects and users
        await tablesDB.createRelationshipColumn(
            databaseId, 
            'projects', 
            'users', 
            'oneToMany',
            false, // twoWay
            'owner', // key in projects
            'projects', // key in users
            'cascade' // onDelete
        );
        
        console.log('Database setup completed successfully!');
    } catch (error) {
        // Handle "already exists" errors gracefully for idempotency
        if (error.code !== 409) {
            console.error('Database setup failed:', error);
            throw error;
        } else {
            console.log('Tables already exist, skipping creation');
        }
    }
}

setupDatabase();
```

**Running the Setup Script:**

```bash
# Set environment variables
export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="your-project-id"
export APPWRITE_API_KEY="your-api-key"
export APPWRITE_DATABASE_ID="your-database-id"

# Run the setup script
node scripts/setup-database.js
```

**Best Practices for Setup Scripts:**

1. **Separate File**: Keep setup scripts in a `scripts/` directory
2. **Documentation**: Add comments explaining each table's purpose and relationships
3. **Testing**: Test the script on a separate development database before production
4. **Migration Strategy**: For schema changes, create new migration scripts instead of modifying the original setup
5. **Backup First**: Always backup production data before running schema changes
6. **Team ID Fields**: Always include `teamId` fields in multi-tenant tables
7. **Timestamp Fields**: Include `createdAt` and `updatedAt` fields for auditing
8. **Foreign Keys**: Use relationship columns to enforce referential integrity

### Best Practices for TablesDB

- **SDK Usage**: Use the `TablesDB` service (formerly `Databases`) for all database operations
- **Permissions & Multi-Tenancy**: ALWAYS use team/member-based roles for permissions (see Permissions & Multi-Tenancy section above). Never use user-specific permissions in multi-tenant applications
- **Tenant Isolation**: Always include `teamId` fields in your rows and filter queries by `teamId` to ensure complete data isolation between tenants
- **Permission Patterns**: Apply team roles (owner, admin, member, viewer) consistently across all tables. Use Role.team() for all permission checks
- **Query Security**: Every multi-tenant query MUST include a `teamId` filter to prevent cross-tenant data access
- **Table Permissions**: Set table-level permissions using team roles, then override at row level when needed
- **Query Optimization**: Use indexes for frequently queried fields, especially on `teamId` and commonly filtered fields
- **Data Validation**: Validate data before creating or updating rows, including team membership validation
- **Transactions**: Use transactions for operations that must succeed or fail together, ensuring atomicity across tenant boundaries
- **Pagination**: Always implement pagination for large datasets to improve performance and reduce response sizes
- **Type Safety**: Use type-safe models when available in your SDK for better code quality and fewer runtime errors

## Storage Operations

**Storage Documentation:**

- [Storage Quick Start](https://appwrite.io/docs/products/storage/quick-start) - Getting started with storage
- [Buckets](https://appwrite.io/docs/products/storage/buckets) - Creating and managing storage buckets
- [Upload & Download](https://appwrite.io/docs/products/storage/upload-download) - File upload and download operations
- [Permissions](https://appwrite.io/docs/products/storage/permissions) - Bucket and file-level permissions
- [Images](https://appwrite.io/docs/products/storage/images) - Image manipulation and transformations

### Best Practices for Storage

- **Permissions & Multi-Tenancy**: ALWAYS use team/member-based roles for storage permissions (see Permissions & Multi-Tenancy section above). Apply Role.team() permissions to buckets and files for proper tenant isolation
- **Bucket Organization**: Consider organizing files by team/tenant using folder structures or bucket naming conventions for easier management
- **Tenant Isolation**: When querying files, always filter by metadata (e.g., `teamId`) to ensure users only access files from their teams
- **File Size Limits**: Set appropriate file size limits to prevent abuse and manage costs
- **File Types**: Validate file types before upload to ensure security and prevent malicious uploads
- **Permission Patterns**: Use team roles (owner, admin, member, viewer) consistently for bucket and file permissions, matching your database permission model
- **Cleanup**: Implement cleanup strategies for unused or temporary files, especially when teams are deleted
- **Virus Scanning**: Consider implementing virus scanning for uploaded files to protect all tenants
- **Access Control**: Validate team membership before allowing file uploads/downloads, even if permissions are set correctly

## Functions

**Functions Documentation:**

- [Functions Quick Start](https://appwrite.io/docs/products/functions/quick-start) - Getting started with serverless functions
- [Develop Functions](https://appwrite.io/docs/products/functions/develop) - Writing and developing functions
- [Execute Functions](https://appwrite.io/docs/products/functions/execute) - Triggering function executions
- [Deployments](https://appwrite.io/docs/products/functions/deployments) - Deploying function code
- [Domains](https://appwrite.io/docs/products/functions/domains) - Custom domains for functions
- [Events](https://appwrite.io/docs/advanced/platform/events) - Event-driven function execution
- [Scheduled Executions](https://appwrite.io/docs/products/functions/execute#schedule) - Cron-based scheduling

### Starter Templates

For getting started with Appwrite Functions, use the official starter template for your runtime:

- **JavaScript/TypeScript Starter**: [View Template](https://github.com/appwrite/templates/tree/main/node/starter)

For more templates and examples, see the [Appwrite Templates Repository](https://github.com/appwrite/templates).

### When to Use Starter Templates

**ALWAYS use starter templates from the [Appwrite Templates Repository](https://github.com/appwrite/templates) when building functions for:**

- **Scheduled Tasks**: Functions that run on a schedule (cron jobs, periodic cleanup, etc.)
- **Event-Driven Tasks**: Functions triggered by Appwrite events (database changes, storage uploads, user events, etc.)
- **Background Processing**: Long-running or resource-intensive operations
- **Integration Functions**: Functions that integrate with third-party services (APIs, webhooks, etc.)
- **Complex Functions**: Any function that requires specific runtime configuration or dependencies

**Why use templates?** Starter templates provide the correct project structure, dependencies, and configuration needed for functions to build and execute successfully. They ensure proper handling of environment variables, logging, error handling, and Appwrite SDK initialization.

### Best Practices for Functions

- **Error Handling**: Implement comprehensive error handling in your functions
- **Timeouts**: Be aware of function execution timeouts and optimize accordingly
- **Environment Variables**: Use environment variables for configuration, not hardcoded values
- **Logging**: Implement proper logging for debugging and monitoring
- **Security**: Validate all inputs and never trust user-provided data
- **Resource Limits**: Be mindful of memory and CPU limits for function executions
- **Template Usage**: Start with official templates for scheduled and event-driven functions to ensure proper setup

## Messaging

**Messaging Documentation:**

- [Messaging Overview](https://appwrite.io/docs/products/messaging) - Getting started with messaging
- [Push Notifications](https://appwrite.io/docs/products/messaging/send-push-notifications) - Sending push notifications
- [Email Messages](https://appwrite.io/docs/products/messaging/send-email-messages) - Sending emails
- [SMS Messages](https://appwrite.io/docs/products/messaging/send-sms-messages) - Sending SMS
- [Topics](https://appwrite.io/docs/products/messaging/topics) - Managing message topics
- [Targets](https://appwrite.io/docs/products/messaging/targets) - Managing message targets
- [Providers](https://appwrite.io/docs/products/messaging/providers) - Configuring messaging providers

### Best Practices for Messaging

- **Provider Selection**: Choose the right messaging provider based on your needs (FCM, APNS, Mailgun, Twilio, etc.)
- **Message Content**: Keep push notifications concise and actionable
- **Scheduling**: Use scheduled messages for better user engagement timing
- **Personalization**: Personalize messages to increase engagement
- **Rate Limiting**: Be mindful of rate limits when sending bulk messages
- **Error Handling**: Implement retry logic for failed message deliveries

## Sites

**Sites Documentation:**

- [Sites Quick Start](https://appwrite.io/docs/products/sites/quick-start) - Getting started with Sites
- [Deploy from Git](https://appwrite.io/docs/products/sites/deploy-from-git) - Git-based deployments
- [Deploy from CLI](https://appwrite.io/docs/products/sites/deploy-from-cli) - CLI deployments
- [Deploy Manually](https://appwrite.io/docs/products/sites/deploy-manually) - Manual file uploads
- [Deployments](https://appwrite.io/docs/products/sites/deployments) - Managing deployments
- [Domains](https://appwrite.io/docs/products/sites/domains) - Custom domain configuration
- [Rendering](https://appwrite.io/docs/products/sites/rendering) - Static vs SSR rendering
- [Frameworks](https://appwrite.io/docs/products/sites/frameworks) - Supported frameworks
- [Rollbacks](https://appwrite.io/docs/products/sites/instant-rollbacks) - Instant rollbacks
- [Previews](https://appwrite.io/docs/products/sites/previews) - Deployment previews

### Best Practices for Sites

- **Environment Variables**: Use environment variables for configuration, not hardcoded values
- **Custom Domains**: Configure custom domains for production sites for better branding
- **Rendering Strategy**: Choose between static and SSR based on your content needs and SEO requirements
- **Deployment Strategy**: Use Git deployments for automatic builds on commits
- **Rollback Plan**: Keep previous deployments ready for instant rollbacks if needed

## Realtime Subscriptions

**Realtime Documentation:**

- [Realtime Overview](https://appwrite.io/docs/products/realtime) - Getting started with realtime
- [Database Subscriptions](https://appwrite.io/docs/products/realtime/subscribe-to-databases) - Subscribe to database changes
- [Storage Subscriptions](https://appwrite.io/docs/products/realtime/subscribe-to-storage) - Subscribe to storage changes
- [Account Subscriptions](https://appwrite.io/docs/products/realtime/subscribe-to-account) - Subscribe to account changes
- [Channels](https://appwrite.io/docs/products/realtime/channels) - Available subscription channels
- [Events](https://appwrite.io/docs/products/realtime/events) - Event types and payloads

### Best Practices for Realtime Subscriptions

- **Connection Management**: Always unsubscribe from channels when components unmount or pages are closed to prevent memory leaks
- **Error Handling**: Implement reconnection logic for dropped connections and handle network errors gracefully
- **Event Filtering**: Filter events on the client side to only process relevant updates for better performance
- **Channel Selection**: Subscribe only to the specific channels you need to minimize bandwidth and improve performance
- **Payload Validation**: Always validate payload data before processing to ensure data integrity
- **Rate Limiting**: Be mindful of the number of subscriptions and events to avoid overwhelming the client
- **State Synchronization**: Use realtime updates to keep local state in sync with server state, but handle conflicts appropriately
- **Authentication**: Ensure proper authentication is in place before subscribing to protected channels
- **Testing**: Test realtime functionality with network interruptions and reconnection scenarios
- **Cleanup**: Store unsubscribe functions and call them in cleanup hooks (useEffect cleanup, componentWillUnmount, etc.)
