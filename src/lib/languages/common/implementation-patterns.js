/**
 * Comprehensive implementation patterns for Appwrite integration
 * These patterns ensure secure, typed, ownership-enforced data access
 */

/**
 * General implementation rules that apply to all Appwrite apps
 */
export const generalImplementationRules = `
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
`;

/**
 * Database-specific implementation rules
 */
export const databaseImplementationRules = `
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

### User-Owned Entities (\`createdBy\`)

Every user-owned table must include a \`createdBy\` column.

| Operation | Rule |
|-----------|------|
| **Create** | Set \`createdBy\` to authenticated user's \`$id\` |
| **List** | Filter with \`Query.equal('createdBy', [userId])\` |
| **Read** | Verify ownership before returning data |
| **Update** | Confirm ownership; NEVER allow \`createdBy\` to change |
| **Delete** | Confirm ownership before deletion |

### Team-Owned Entities (\`teamId\`)

For shared workspaces and organization data:

| Operation | Rule |
|-----------|------|
| **Create** | Set \`teamId\`; verify user is team member |
| **List** | Filter with \`Query.equal('teamId', [teamId])\` |
| **Read** | Verify team match AND user membership |
| **Update** | Confirm membership; NEVER allow \`teamId\` to change |
| **Delete** | Confirm membership before deletion |

---

## Database Usage Rules

- Import database helpers from centralized location only
- Operate on **tables**, expect **rows**
- Create payloads: exclude system columns (\`$id\`, \`$createdAt\`, \`$updatedAt\`)
- Update payloads: partial data, exclude system and ownership columns
- NEVER modify: \`$id\`, \`$createdAt\`, \`$updatedAt\`, \`createdBy\`, \`teamId\`
- Use \`Query.equal()\` for ownership filtering
- Return serialized/structured objects only (no raw SDK responses)

---

## Sanitization & Payload Rules

- Trim all user-provided strings
- Convert empty optional text to \`null\` (or language equivalent)
- Creates: require full payload (minus system fields)
- Updates: accept partial payload
- Ownership fields (\`createdBy\`, \`teamId\`) are IMMUTABLE after creation
`;

/**
 * Storage-specific implementation rules
 */
export const storageImplementationRules = `
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

\`\`\`
Client → Server: base64 string (or file bytes)
Server: Decode base64 → bytes/buffer → InputFile
Server → Storage: InputFile
Storage → Server: File metadata
Server → Client: file ID only
\`\`\`

Rules:
- Strip \`data:...;base64,\` prefix before processing
- Decode base64 to bytes using your language's standard library
- Use the SDK's InputFile helper for uploads
- NEVER store base64 strings in database
- Store **file IDs only** in database fields

### Read Flow

\`\`\`
Server: Fetch file from storage (binary/bytes)
Server: Convert bytes → base64 → data URL
Server → Client: data URL string (or secure download URL)
\`\`\`

- NEVER expose raw binary data to client
- Always return URL strings or base64 data URLs

---

## File References in Rows

- Store file references as string arrays (\`fileIds\` field)
- On row load, fetch file URLs and inject into response
- Handle missing files gracefully
- Implement orphaned file cleanup when rows are deleted
`;

/**
 * TanStack Start specific implementation pattern
 */
export const tanstackStartPattern = `
## TanStack Start Server Function Pattern

### Mandatory Structure

Every endpoint must:
1. Use \`createServerFn\` wrapper
2. Attach \`.validator(...)\` for input validation
3. Authenticate immediately in handler
4. Call ONLY centralized db/storage helpers
5. Return plain serializable objects

### Canonical Example

\`\`\`typescript
import { createServerFn } from '@tanstack/start'

export const createItemFn = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    // 1. Authenticate first
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    // 2. Use centralized db helper
    const item = await db.items.create({
      title: data.title.trim(),
      description: null,
      createdBy: currentUser.$id,
      teamId: data.teamId ?? null,
    })

    // 3. Return serialized object
    return { item }
  })
\`\`\`

### Route Integration

\`\`\`typescript
// In route loader
export const Route = createFileRoute('/items')({
  loader: async () => {
    const { items } = await listItemsFn()
    return { items }
  },
})

// In component
function ItemsPage() {
  const { items } = Route.useLoaderData()
  const router = useRouter()
  
  const handleCreate = async (data) => {
    await createItemFn({ data })
    router.invalidate() // Refresh data
  }
}
\`\`\`

### Environment Variables

Required in \`@/server/lib/appwrite.ts\`:
- \`APPWRITE_ENDPOINT\`
- \`APPWRITE_PROJECT_ID\`
- \`APPWRITE_API_KEY\`
- \`APPWRITE_DATABASE_ID\`
- \`APPWRITE_BUCKET_ID\` (if using storage)
`;

/**
 * Next.js specific implementation pattern
 */
export const nextjsPattern = `
## Next.js Server Action Pattern

### Mandatory Structure (App Router)

Every server action must:
1. Be marked with \`'use server'\`
2. Authenticate immediately
3. Validate input
4. Use centralized db/storage helpers only
5. Return plain serializable objects

### Canonical Example

\`\`\`typescript
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
\`\`\`

### Route Handler Pattern

\`\`\`typescript
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
\`\`\`

### Server Component Data Fetching

\`\`\`typescript
// app/items/page.tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function ItemsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const items = await db.items.listByOwner(session.user.id)
  
  return <ItemsList items={items} />
}
\`\`\`

### Environment Variables

Required in \`.env.local\`:
- \`APPWRITE_ENDPOINT\`
- \`APPWRITE_PROJECT_ID\`
- \`APPWRITE_API_KEY\`
- \`APPWRITE_DATABASE_ID\`
- \`APPWRITE_BUCKET_ID\` (if using storage)
`;

/**
 * SvelteKit specific implementation pattern
 */
export const sveltekitPattern = `
## SvelteKit Server Pattern

### Mandatory Structure

Every server operation must:
1. Use \`+server.ts\` for API routes or \`+page.server.ts\` for page data
2. Authenticate via \`locals\` or session check
3. Validate input
4. Use centralized db/storage helpers only
5. Return plain serializable objects

### Form Actions Pattern

\`\`\`typescript
// routes/items/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'

export const actions = {
  create: async ({ request, locals }) => {
    // 1. Authenticate first
    if (!locals.user) throw redirect(303, '/login')

    // 2. Validate input
    const formData = await request.formData()
    const title = formData.get('title')?.toString()
    const teamId = formData.get('teamId')?.toString()
    
    if (!title || title.length === 0 || title.length > 120) {
      return fail(400, { error: 'Invalid title' })
    }

    // 3. Use centralized db helper
    const item = await db.items.create({
      title: title.trim(),
      description: null,
      createdBy: locals.user.id,
      teamId: teamId ?? null,
    })

    return { success: true, item }
  },
  
  delete: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login')
    
    const formData = await request.formData()
    const id = formData.get('id') as string
    
    // Verify ownership before delete
    const item = await db.items.get(id)
    if (item?.createdBy !== locals.user.id) {
      return fail(403, { error: 'Forbidden' })
    }
    
    await db.items.delete(id)
    return { success: true }
  }
}
\`\`\`

### Load Function Pattern

\`\`\`typescript
// routes/items/+page.server.ts
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/login')
  
  const items = await db.items.listByOwner(locals.user.id)
  
  return { items }
}
\`\`\`

### API Route Pattern

\`\`\`typescript
// routes/api/items/+server.ts
import { json, error } from '@sveltejs/kit'
import { db } from '$lib/server/db'

export async function GET({ locals }) {
  if (!locals.user) throw error(401, 'Unauthorized')
  
  const items = await db.items.listByOwner(locals.user.id)
  return json({ items })
}

export async function POST({ request, locals }) {
  if (!locals.user) throw error(401, 'Unauthorized')
  
  const body = await request.json()
  const item = await db.items.create({
    ...body,
    createdBy: locals.user.id,
  })
  
  return json({ item }, { status: 201 })
}
\`\`\`

### Environment Variables

Required in \`.env\`:
- \`APPWRITE_ENDPOINT\`
- \`APPWRITE_PROJECT_ID\`
- \`APPWRITE_API_KEY\`
- \`APPWRITE_DATABASE_ID\`
- \`APPWRITE_BUCKET_ID\` (if using storage)
`;

/**
 * Nuxt specific implementation pattern
 */
export const nuxtPattern = `
## Nuxt Server Pattern

### Mandatory Structure

Every server operation must:
1. Use \`server/api/\` routes or \`server/routes/\`
2. Authenticate via \`event.context\` or session
3. Validate input
4. Use centralized db/storage helpers only
5. Return plain serializable objects

### API Route Pattern

\`\`\`typescript
// server/api/items/index.get.ts
import { db } from '~/server/lib/db'

export default defineEventHandler(async (event) => {
  // 1. Authenticate first
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. Use centralized db helper
  const items = await db.items.listByOwner(user.id)
  
  return { items }
})
\`\`\`

\`\`\`typescript
// server/api/items/index.post.ts
import { db } from '~/server/lib/db'

export default defineEventHandler(async (event) => {
  // 1. Authenticate first
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // 2. Validate input
  const body = await readBody(event)
  const { title, teamId } = body
  
  if (!title || title.length === 0 || title.length > 120) {
    throw createError({ statusCode: 400, message: 'Invalid title' })
  }

  // 3. Use centralized db helper
  const item = await db.items.create({
    title: title.trim(),
    description: null,
    createdBy: user.id,
    teamId: teamId ?? null,
  })

  return { item }
})
\`\`\`

### Ownership Verification

\`\`\`typescript
// server/api/items/[id].delete.ts
import { db } from '~/server/lib/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  
  // Verify ownership before delete
  const item = await db.items.get(id)
  if (!item || item.createdBy !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  
  await db.items.delete(id)
  return { success: true }
})
\`\`\`

### Composables Pattern

\`\`\`typescript
// composables/useItems.ts
export function useItems() {
  const items = ref([])
  
  async function fetchItems() {
    const { data } = await useFetch('/api/items')
    items.value = data.value?.items ?? []
  }
  
  async function createItem(title: string) {
    await $fetch('/api/items', {
      method: 'POST',
      body: { title }
    })
    await fetchItems() // Refresh
  }
  
  return { items, fetchItems, createItem }
}
\`\`\`

### Environment Variables

Required in \`.env\` or \`nuxt.config.ts\`:
- \`APPWRITE_ENDPOINT\`
- \`APPWRITE_PROJECT_ID\`
- \`APPWRITE_API_KEY\`
- \`APPWRITE_DATABASE_ID\`
- \`APPWRITE_BUCKET_ID\` (if using storage)
`;

/**
 * Astro specific implementation pattern
 */
export const astroPattern = `
## Astro Server Pattern

### Mandatory Structure

Every server operation must:
1. Use API routes in \`src/pages/api/\`
2. Authenticate via request context or session
3. Validate input
4. Use centralized db/storage helpers only
5. Return plain serializable objects

### API Route Pattern

\`\`\`typescript
// src/pages/api/items/index.ts
import type { APIRoute } from 'astro'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const GET: APIRoute = async ({ request }) => {
  // 1. Authenticate first
  const session = await getSession(request)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Use centralized db helper
  const items = await db.items.listByOwner(session.user.id)
  
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request)
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const body = await request.json()
  const { title } = body
  
  if (!title || title.length === 0 || title.length > 120) {
    return new Response(JSON.stringify({ error: 'Invalid title' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const item = await db.items.create({
    title: title.trim(),
    createdBy: session.user.id,
  })

  return new Response(JSON.stringify({ item }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  })
}
\`\`\`

### Server-Side Data Fetching

\`\`\`astro
---
// src/pages/items.astro
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import ItemsList from '@/components/ItemsList'

const session = await getSession(Astro.request)
if (!session?.user) {
  return Astro.redirect('/login')
}

const items = await db.items.listByOwner(session.user.id)
---

<Layout>
  <ItemsList items={items} client:load />
</Layout>
\`\`\`

### Environment Variables

Required in \`.env\`:
- \`APPWRITE_ENDPOINT\`
- \`APPWRITE_PROJECT_ID\`
- \`APPWRITE_API_KEY\`
- \`APPWRITE_DATABASE_ID\`
- \`APPWRITE_BUCKET_ID\` (if using storage)
`;

/**
 * Database wrapper templates for each language
 */
const databaseWrapperTemplates = {
  javascript: `
## Database Wrapper Template

Create a centralized database helper at your designated location (e.g., \`lib/db.ts\` or \`server/lib/db.ts\`):

\`\`\`typescript
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
\`\`\`
`,

  python: `
## Database Wrapper Template

Create a centralized database helper at \`services/db.py\`:

\`\`\`python
import os
from typing import TypeVar, Generic, Optional, List, Dict, Any
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.query import Query
from appwrite.id import ID

# Initialize admin client (server-side only)
client = Client()
client.set_endpoint(os.environ['APPWRITE_ENDPOINT'])
client.set_project(os.environ['APPWRITE_PROJECT_ID'])
client.set_key(os.environ['APPWRITE_API_KEY'])

tables_db = TablesDB(client)
DATABASE_ID = os.environ['APPWRITE_DATABASE_ID']

T = TypeVar('T')

class Table(Generic[T]):
    def __init__(self, table_id: str):
        self.table_id = table_id
    
    def create(self, data: Dict[str, Any]) -> T:
        """Create row with auto-generated ID"""
        doc = tables_db.create_row(
            DATABASE_ID,
            self.table_id,
            ID.unique(),
            data
        )
        return doc
    
    def get(self, row_id: str) -> Optional[T]:
        """Get row by ID"""
        try:
            return tables_db.get_row(
                DATABASE_ID,
                self.table_id,
                row_id
            )
        except Exception:
            return None
    
    def list_by_owner(self, user_id: str) -> List[T]:
        """List rows by owner"""
        result = tables_db.list_rows(
            DATABASE_ID,
            self.table_id,
            [
                Query.equal('createdBy', user_id),
                Query.order_desc('$createdAt')
            ]
        )
        return result['rows']
    
    def list_by_team(self, team_id: str) -> List[T]:
        """List rows by team"""
        result = tables_db.list_rows(
            DATABASE_ID,
            self.table_id,
            [
                Query.equal('teamId', team_id),
                Query.order_desc('$createdAt')
            ]
        )
        return result['rows']
    
    def update(self, row_id: str, data: Dict[str, Any]) -> T:
        """Update row (removes immutable columns)"""
        safe_data = {k: v for k, v in data.items() 
                     if k not in ('$id', '$createdAt', '$updatedAt', 'createdBy', 'teamId')}
        return tables_db.update_row(
            DATABASE_ID,
            self.table_id,
            row_id,
            safe_data
        )
    
    def delete(self, row_id: str) -> None:
        """Delete row"""
        tables_db.delete_row(DATABASE_ID, self.table_id, row_id)

# Export typed tables
items = Table('items')
projects = Table('projects')
\`\`\`
`,

  php: `
## Database Wrapper Template

Create a centralized database helper at \`src/Services/DatabaseService.php\`:

\`\`\`php
<?php
namespace App\\Services;

use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\ID;
use Appwrite\\Query;

class DatabaseService
{
    private static ?Client $client = null;
    private static ?TablesDB $tablesDB = null;
    private string $databaseId;
    private string $tableId;
    
    public function __construct(string $tableId)
    {
        $this->tableId = $tableId;
        $this->databaseId = $_ENV['APPWRITE_DATABASE_ID'];
    }
    
    private static function getClient(): Client
    {
        if (self::$client === null) {
            self::$client = new Client();
            self::$client
                ->setEndpoint($_ENV['APPWRITE_ENDPOINT'])
                ->setProject($_ENV['APPWRITE_PROJECT_ID'])
                ->setKey($_ENV['APPWRITE_API_KEY']);
        }
        return self::$client;
    }
    
    private static function getTablesDB(): TablesDB
    {
        if (self::$tablesDB === null) {
            self::$tablesDB = new TablesDB(self::getClient());
        }
        return self::$tablesDB;
    }
    
    public function create(array $data): array
    {
        return self::getTablesDB()->createRow(
            $this->databaseId,
            $this->tableId,
            ID::unique(),
            $data
        );
    }
    
    public function get(string $rowId): ?array
    {
        try {
            return self::getTablesDB()->getRow(
                $this->databaseId,
                $this->tableId,
                $rowId
            );
        } catch (\\Exception $e) {
            return null;
        }
    }
    
    public function listByOwner(string $userId): array
    {
        $result = self::getTablesDB()->listRows(
            $this->databaseId,
            $this->tableId,
            [
                Query::equal('createdBy', [$userId]),
                Query::orderDesc('\\$createdAt')
            ]
        );
        return $result['rows'];
    }
    
    public function listByTeam(string $teamId): array
    {
        $result = self::getTablesDB()->listRows(
            $this->databaseId,
            $this->tableId,
            [
                Query::equal('teamId', [$teamId]),
                Query::orderDesc('\\$createdAt')
            ]
        );
        return $result['rows'];
    }
    
    public function update(string $rowId, array $data): array
    {
        // Remove immutable columns
        unset($data['\\$id'], $data['\\$createdAt'], $data['\\$updatedAt'], 
              $data['createdBy'], $data['teamId']);
        
        return self::getTablesDB()->updateRow(
            $this->databaseId,
            $this->tableId,
            $rowId,
            $data
        );
    }
    
    public function delete(string $rowId): void
    {
        self::getTablesDB()->deleteRow(
            $this->databaseId,
            $this->tableId,
            $rowId
        );
    }
}

// Usage: $items = new DatabaseService('items');
\`\`\`
`,

  go: `
## Database Wrapper Template

Create a centralized database helper at \`internal/db/db.go\`:

\`\`\`go
package db

import (
    "os"
    "sync"
    
    "github.com/appwrite/sdk-for-go/appwrite"
    "github.com/appwrite/sdk-for-go/id"
    "github.com/appwrite/sdk-for-go/query"
)

var (
    client     *appwrite.Client
    tablesDB   *appwrite.TablesDB
    once       sync.Once
    DatabaseID string
)

func init() {
    once.Do(func() {
        client = appwrite.NewClient()
        client.SetEndpoint(os.Getenv("APPWRITE_ENDPOINT"))
        client.SetProject(os.Getenv("APPWRITE_PROJECT_ID"))
        client.SetKey(os.Getenv("APPWRITE_API_KEY"))
        
        tablesDB = appwrite.NewTablesDB(client)
        DatabaseID = os.Getenv("APPWRITE_DATABASE_ID")
    })
}

type Table struct {
    ID string
}

func NewTable(tableID string) *Table {
    return &Table{ID: tableID}
}

func (c *Table) Create(data map[string]interface{}) (map[string]interface{}, error) {
    doc, err := tablesDB.CreateRow(DatabaseID, c.ID, id.Unique(), data)
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) Get(rowID string) (map[string]interface{}, error) {
    doc, err := tablesDB.GetRow(DatabaseID, c.ID, rowID)
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) ListByOwner(userID string) ([]map[string]interface{}, error) {
    result, err := tablesDB.ListRows(
        DatabaseID,
        c.ID,
        tablesDB.WithListRowsQueries([]string{
            query.Equal("createdBy", userID),
            query.OrderDesc("$createdAt"),
        }),
    )
    if err != nil {
        return nil, err
    }
    
    docs := make([]map[string]interface{}, len(result.Rows))
    for i, doc := range result.Rows {
        docs[i] = doc.ToMap()
    }
    return docs, nil
}

func (c *Table) ListByTeam(teamID string) ([]map[string]interface{}, error) {
    result, err := tablesDB.ListRows(
        DatabaseID,
        c.ID,
        tablesDB.WithListRowsQueries([]string{
            query.Equal("teamId", teamID),
            query.OrderDesc("$createdAt"),
        }),
    )
    if err != nil {
        return nil, err
    }
    
    docs := make([]map[string]interface{}, len(result.Rows))
    for i, doc := range result.Rows {
        docs[i] = doc.ToMap()
    }
    return docs, nil
}

func (c *Table) Update(rowID string, data map[string]interface{}) (map[string]interface{}, error) {
    // Remove immutable columns
    delete(data, "$id")
    delete(data, "$createdAt")
    delete(data, "$updatedAt")
    delete(data, "createdBy")
    delete(data, "teamId")
    
    doc, err := tablesDB.UpdateRow(DatabaseID, c.ID, rowID, data)
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) Delete(rowID string) error {
    _, err := tablesDB.DeleteRow(DatabaseID, c.ID, rowID)
    return err
}

// Exported tables
var (
    Items    = NewTable("items")
    Projects = NewTable("projects")
)
\`\`\`
`,

  ruby: `
## Database Wrapper Template

Create a centralized database helper at \`lib/database_service.rb\`:

\`\`\`ruby
require 'appwrite'

module DatabaseService
  class << self
    def client
      @client ||= begin
        client = Appwrite::Client.new
        client
          .set_endpoint(ENV['APPWRITE_ENDPOINT'])
          .set_project(ENV['APPWRITE_PROJECT_ID'])
          .set_key(ENV['APPWRITE_API_KEY'])
        client
      end
    end
    
    def tables_db
      @tables_db ||= Appwrite::TablesDB.new(client)
    end
    
    def database_id
      ENV['APPWRITE_DATABASE_ID']
    end
  end
  
  class Table
    def initialize(table_id)
      @table_id = table_id
    end
    
    def create(data)
      DatabaseService.tables_db.create_row(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        row_id: Appwrite::ID.unique,
        data: data
      )
    end
    
    def get(row_id)
      DatabaseService.tables_db.get_row(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        row_id: row_id
      )
    rescue Appwrite::Exception
      nil
    end
    
    def list_by_owner(user_id)
      result = DatabaseService.tables_db.list_rows(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        queries: [
          Appwrite::Query.equal('createdBy', [user_id]),
          Appwrite::Query.order_desc('$createdAt')
        ]
      )
      result.rows
    end
    
    def list_by_team(team_id)
      result = DatabaseService.tables_db.list_rows(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        queries: [
          Appwrite::Query.equal('teamId', [team_id]),
          Appwrite::Query.order_desc('$createdAt')
        ]
      )
      result.rows
    end
    
    def update(row_id, data)
      # Remove immutable fields
      safe_data = data.except('$id', '$createdAt', '$updatedAt', 'createdBy', 'teamId')
      
      DatabaseService.tables_db.update_row(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        row_id: row_id,
        data: safe_data
      )
    end
    
    def delete(row_id)
      DatabaseService.tables_db.delete_row(
        database_id: DatabaseService.database_id,
        table_id: @table_id,
        row_id: row_id
      )
    end
  end
end

# Convenience accessors
module DB
  def self.items
    @items ||= DatabaseService::Table.new('items')
  end
  
  def self.projects
    @projects ||= DatabaseService::Table.new('projects')
  end
end
\`\`\`
`,

  dotnet: `
## Database Wrapper Template

Create a centralized database helper at \`Services/DatabaseService.cs\`:

\`\`\`csharp
using Appwrite;
using Appwrite.Services;
using Appwrite.Models;

public class DatabaseService<T> where T : class
{
    private static Client? _client;
    private static TablesDB? _tablesDB;
    private readonly string _tableId;
    
    public static string DatabaseId => Environment.GetEnvironmentVariable("APPWRITE_DATABASE_ID")!;
    
    private static Client GetClient()
    {
        if (_client == null)
        {
            _client = new Client()
                .SetEndpoint(Environment.GetEnvironmentVariable("APPWRITE_ENDPOINT")!)
                .SetProject(Environment.GetEnvironmentVariable("APPWRITE_PROJECT_ID")!)
                .SetKey(Environment.GetEnvironmentVariable("APPWRITE_API_KEY")!);
        }
        return _client;
    }
    
    private static TablesDB GetTablesDB()
    {
        return _tablesDB ??= new TablesDB(GetClient());
    }
    
    public DatabaseService(string tableId)
    {
        _tableId = tableId;
    }
    
    public async Task<Row> CreateAsync(Dictionary<string, object> data)
    {
        return await GetTablesDB().CreateRow(
            databaseId: DatabaseId,
            tableId: _tableId,
            rowId: ID.Unique(),
            data: data
        );
    }
    
    public async Task<Row?> GetAsync(string rowId)
    {
        try
        {
            return await GetTablesDB().GetRow(
                databaseId: DatabaseId,
                tableId: _tableId,
                rowId: rowId
            );
        }
        catch (AppwriteException)
        {
            return null;
        }
    }
    
    public async Task<List<Row>> ListByOwnerAsync(string userId)
    {
        var result = await GetTablesDB().ListRows(
            databaseId: DatabaseId,
            tableId: _tableId,
            queries: new List<string>
            {
                Query.Equal("createdBy", new List<string> { userId }),
                Query.OrderDesc("$createdAt")
            }
        );
        return result.Rows;
    }
    
    public async Task<List<Row>> ListByTeamAsync(string teamId)
    {
        var result = await GetTablesDB().ListRows(
            databaseId: DatabaseId,
            tableId: _tableId,
            queries: new List<string>
            {
                Query.Equal("teamId", new List<string> { teamId }),
                Query.OrderDesc("$createdAt")
            }
        );
        return result.Rows;
    }
    
    public async Task<Row> UpdateAsync(string rowId, Dictionary<string, object> data)
    {
        // Remove immutable columns
        data.Remove("$id");
        data.Remove("$createdAt");
        data.Remove("$updatedAt");
        data.Remove("createdBy");
        data.Remove("teamId");
        
        return await GetTablesDB().UpdateRow(
            databaseId: DatabaseId,
            tableId: _tableId,
            rowId: rowId,
            data: data
        );
    }
    
    public async Task DeleteAsync(string rowId)
    {
        await GetTablesDB().DeleteRow(
            databaseId: DatabaseId,
            tableId: _tableId,
            rowId: rowId
        );
    }
}

// Static accessors
public static class DB
{
    public static DatabaseService<object> Items { get; } = new("items");
    public static DatabaseService<object> Projects { get; } = new("projects");
}
\`\`\`
`,

  dart: `
## Database Wrapper Template

Create a centralized database helper at \`lib/services/database.dart\`:

\`\`\`dart
import 'dart:io';
import 'package:dart_appwrite/dart_appwrite.dart';

class AppwriteService {
  static Client? _client;
  static TablesDB? _tablesDB;
  
  static String get databaseId => Platform.environment['APPWRITE_DATABASE_ID']!;
  
  static Client get client {
    _client ??= Client()
      .setEndpoint(Platform.environment['APPWRITE_ENDPOINT']!)
      .setProject(Platform.environment['APPWRITE_PROJECT_ID']!)
      .setKey(Platform.environment['APPWRITE_API_KEY']!);
    return _client!;
  }
  
  static TablesDB get tablesDB {
    _tablesDB ??= TablesDB(client);
    return _tablesDB!;
  }
}

class Table<T> {
  final String tableId;
  
  Table(this.tableId);
  
  Future<Row> create(Map<String, dynamic> data) async {
    return await AppwriteService.tablesDB.createRow(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: ID.unique(),
      data: data,
    );
  }
  
  Future<Row?> get(String rowId) async {
    try {
      return await AppwriteService.tablesDB.getRow(
        databaseId: AppwriteService.databaseId,
        tableId: tableId,
        rowId: rowId,
      );
    } on AppwriteException {
      return null;
    }
  }
  
  Future<List<Row>> listByOwner(String userId) async {
    final result = await AppwriteService.tablesDB.listRows(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      queries: [
        Query.equal('createdBy', userId),
        Query.orderDesc(r'$createdAt'),
      ],
    );
    return result.rows;
  }
  
  Future<List<Row>> listByTeam(String teamId) async {
    final result = await AppwriteService.tablesDB.listRows(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      queries: [
        Query.equal('teamId', teamId),
        Query.orderDesc(r'$createdAt'),
      ],
    );
    return result.rows;
  }
  
  Future<Row> update(String rowId, Map<String, dynamic> data) async {
    // Remove immutable columns
    data.remove(r'$id');
    data.remove(r'$createdAt');
    data.remove(r'$updatedAt');
    data.remove('createdBy');
    data.remove('teamId');
    
    return await AppwriteService.tablesDB.updateRow(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: rowId,
      data: data,
    );
  }
  
  Future<void> delete(String rowId) async {
    await AppwriteService.tablesDB.deleteRow(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: rowId,
    );
  }
}

// Exported tables
final items = Table<dynamic>('items');
final projects = Table<dynamic>('projects');
\`\`\`
`,

  kotlin: `
## Database Wrapper Template

Create a centralized database helper at \`services/DatabaseService.kt\`:

\`\`\`kotlin
package com.example.services

import io.appwrite.Client
import io.appwrite.ID
import io.appwrite.Query
import io.appwrite.models.Row
import io.appwrite.services.TablesDB

object AppwriteService {
    val databaseId: String = System.getenv("APPWRITE_DATABASE_ID")
    
    val client: Client by lazy {
        Client()
            .setEndpoint(System.getenv("APPWRITE_ENDPOINT"))
            .setProject(System.getenv("APPWRITE_PROJECT_ID"))
            .setKey(System.getenv("APPWRITE_API_KEY"))
    }
    
    val tablesDB: TablesDB by lazy { TablesDB(client) }
}

class Table(private val tableId: String) {
    private val tablesDB = AppwriteService.tablesDB
    private val databaseId = AppwriteService.databaseId
    
    suspend fun create(data: Map<String, Any?>): Row<Map<String, Any>> {
        return tablesDB.createRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = ID.unique(),
            data = data
        )
    }
    
    suspend fun get(rowId: String): Row<Map<String, Any>>? {
        return try {
            tablesDB.getRow(
                databaseId = databaseId,
                tableId = tableId,
                rowId = rowId
            )
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun listByOwner(userId: String): List<Row<Map<String, Any>>> {
        val result = tablesDB.listRows(
            databaseId = databaseId,
            tableId = tableId,
            queries = listOf(
                Query.equal("createdBy", listOf(userId)),
                Query.orderDesc("\$createdAt")
            )
        )
        return result.rows
    }
    
    suspend fun listByTeam(teamId: String): List<Row<Map<String, Any>>> {
        val result = tablesDB.listRows(
            databaseId = databaseId,
            tableId = tableId,
            queries = listOf(
                Query.equal("teamId", listOf(teamId)),
                Query.orderDesc("\$createdAt")
            )
        )
        return result.rows
    }
    
    suspend fun update(rowId: String, data: Map<String, Any?>): Row<Map<String, Any>> {
        // Remove immutable columns
        val safeData = data.filterKeys { 
            it !in listOf("\$id", "\$createdAt", "\$updatedAt", "createdBy", "teamId")
        }
        
        return tablesDB.updateRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = rowId,
            data = safeData
        )
    }
    
    suspend fun delete(rowId: String) {
        tablesDB.deleteRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = rowId
        )
    }
}

// Exported tables
object DB {
    val items = Table("items")
    val projects = Table("projects")
}
\`\`\`
`,

  swift: `
## Database Wrapper Template

Create a centralized database helper at \`Services/DatabaseService.swift\`:

\`\`\`swift
import Appwrite
import Foundation

class AppwriteService {
    static let shared = AppwriteService()
    
    let client: Client
    let tablesDB: TablesDB
    let databaseId: String
    
    private init() {
        client = Client()
            .setEndpoint(ProcessInfo.processInfo.environment["APPWRITE_ENDPOINT"]!)
            .setProject(ProcessInfo.processInfo.environment["APPWRITE_PROJECT_ID"]!)
            .setKey(ProcessInfo.processInfo.environment["APPWRITE_API_KEY"]!)
        
        tablesDB = TablesDB(client)
        databaseId = ProcessInfo.processInfo.environment["APPWRITE_DATABASE_ID"]!
    }
}

class Table {
    let tableId: String
    private let tablesDB: TablesDB
    private let databaseId: String
    
    init(_ tableId: String) {
        self.tableId = tableId
        self.tablesDB = AppwriteService.shared.tablesDB
        self.databaseId = AppwriteService.shared.databaseId
    }
    
    func create(data: [String: Any]) async throws -> Row<[String: AnyCodable]> {
        return try await tablesDB.createRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: ID.unique(),
            data: data
        )
    }
    
    func get(rowId: String) async throws -> Row<[String: AnyCodable]>? {
        do {
            return try await tablesDB.getRow(
                databaseId: databaseId,
                tableId: tableId,
                rowId: rowId
            )
        } catch {
            return nil
        }
    }
    
    func listByOwner(userId: String) async throws -> [Row<[String: AnyCodable]>] {
        let result = try await tablesDB.listRows(
            databaseId: databaseId,
            tableId: tableId,
            queries: [
                Query.equal("createdBy", value: userId),
                Query.orderDesc("$createdAt")
            ]
        )
        return result.rows
    }
    
    func listByTeam(teamId: String) async throws -> [Row<[String: AnyCodable]>] {
        let result = try await tablesDB.listRows(
            databaseId: databaseId,
            tableId: tableId,
            queries: [
                Query.equal("teamId", value: teamId),
                Query.orderDesc("$createdAt")
            ]
        )
        return result.rows
    }
    
    func update(rowId: String, data: [String: Any]) async throws -> Row<[String: AnyCodable]> {
        // Remove immutable columns
        var safeData = data
        safeData.removeValue(forKey: "$id")
        safeData.removeValue(forKey: "$createdAt")
        safeData.removeValue(forKey: "$updatedAt")
        safeData.removeValue(forKey: "createdBy")
        safeData.removeValue(forKey: "teamId")
        
        return try await tablesDB.updateRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: rowId,
            data: safeData
        )
    }
    
    func delete(rowId: String) async throws {
        _ = try await tablesDB.deleteRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: rowId
        )
    }
}

// Exported tables
struct DB {
    static let items = Table("items")
    static let projects = Table("projects")
}
\`\`\`
`
};

/**
 * Get database wrapper template for a specific SDK
 * @param {string} sdk - SDK name (javascript, python, php, etc.)
 * @returns {string} Database wrapper template
 */
export function getDatabaseWrapperTemplate(sdk) {
  // Map SDK names to template keys
  /** @type {Record<string, string>} */
  const sdkMap = {
    javascript: 'javascript',
    'react-native': 'javascript',
    python: 'python',
    php: 'php',
    go: 'go',
    flutter: 'dart',
    dart: 'dart',
    apple: 'swift',
    android: 'kotlin',
    swift: 'swift',
    kotlin: 'kotlin',
    ruby: 'ruby',
    dotnet: 'dotnet'
  };
  
  const templateKey = sdkMap[sdk] || 'javascript';
  /** @type {Record<string, string>} */
  const templates = databaseWrapperTemplates;
  return templates[templateKey] || templates.javascript;
}

// Legacy export for backwards compatibility
export const databaseWrapperTemplate = databaseWrapperTemplates.javascript;

/**
 * Storage wrapper templates for each language
 */
const storageWrapperTemplates = {
  javascript: `
## Storage Wrapper Template

Create a centralized storage helper:

\`\`\`typescript
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
    return \`data:\${mimeType};base64,\${base64}\`
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
\`\`\`
`,

  python: `
## Storage Wrapper Template

Create a centralized storage helper at \`services/storage.py\`:

\`\`\`python
import os
import base64
from typing import Optional
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.id import ID
from appwrite.input_file import InputFile

# Initialize admin client (server-side only)
client = Client()
client.set_endpoint(os.environ['APPWRITE_ENDPOINT'])
client.set_project(os.environ['APPWRITE_PROJECT_ID'])
client.set_key(os.environ['APPWRITE_API_KEY'])

storage = Storage(client)
BUCKET_ID = os.environ.get('APPWRITE_BUCKET_ID', '')

class FileStorage:
    @staticmethod
    def upload(base64_data: str, file_name: str, mime_type: str) -> str:
        """
        Upload file from base64 string
        Returns: File ID only (never store base64 in database)
        """
        # Strip data URL prefix if present
        if ';base64,' in base64_data:
            base64_data = base64_data.split(';base64,')[1]
        
        # Decode base64 to bytes
        file_bytes = base64.b64decode(base64_data)
        
        # Create InputFile from bytes
        input_file = InputFile.from_bytes(file_bytes, file_name, mime_type)
        
        # Upload to storage
        result = storage.create_file(BUCKET_ID, ID.unique(), input_file)
        
        return result['$id']
    
    @staticmethod
    def get_as_data_url(file_id: str, mime_type: str) -> str:
        """Get file as data URL for client consumption"""
        file_bytes = storage.get_file_download(BUCKET_ID, file_id)
        base64_str = base64.b64encode(file_bytes).decode('utf-8')
        return f"data:{mime_type};base64,{base64_str}"
    
    @staticmethod
    def get_preview_url(file_id: str, width: Optional[int] = None, height: Optional[int] = None) -> str:
        """Get file preview URL"""
        return storage.get_file_preview(BUCKET_ID, file_id, width=width, height=height)
    
    @staticmethod
    def delete(file_id: str) -> None:
        """Delete file"""
        storage.delete_file(BUCKET_ID, file_id)
    
    @staticmethod
    def delete_many(file_ids: list) -> None:
        """Delete multiple files (for cleanup)"""
        for file_id in file_ids:
            try:
                storage.delete_file(BUCKET_ID, file_id)
            except Exception:
                pass  # Continue even if some files fail

file_storage = FileStorage()
\`\`\`
`,

  php: `
## Storage Wrapper Template

Create a centralized storage helper at \`src/Services/StorageService.php\`:

\`\`\`php
<?php
namespace App\\Services;

use Appwrite\\Client;
use Appwrite\\Services\\Storage;
use Appwrite\\ID;
use Appwrite\\InputFile;

class StorageService
{
    private static ?Client $client = null;
    private static ?Storage $storage = null;
    private string $bucketId;
    
    public function __construct()
    {
        $this->bucketId = $_ENV['APPWRITE_BUCKET_ID'];
    }
    
    private static function getClient(): Client
    {
        if (self::$client === null) {
            self::$client = new Client();
            self::$client
                ->setEndpoint($_ENV['APPWRITE_ENDPOINT'])
                ->setProject($_ENV['APPWRITE_PROJECT_ID'])
                ->setKey($_ENV['APPWRITE_API_KEY']);
        }
        return self::$client;
    }
    
    private static function getStorage(): Storage
    {
        if (self::$storage === null) {
            self::$storage = new Storage(self::getClient());
        }
        return self::$storage;
    }
    
    /**
     * Upload file from base64 string
     * @return string File ID only (never store base64 in database)
     */
    public function upload(string $base64Data, string $fileName, string $mimeType): string
    {
        // Strip data URL prefix if present
        if (strpos($base64Data, ';base64,') !== false) {
            $base64Data = explode(';base64,', $base64Data)[1];
        }
        
        // Decode base64 to binary
        $fileData = base64_decode($base64Data);
        
        // Create InputFile
        $inputFile = InputFile::withData($fileData, $fileName, $mimeType);
        
        // Upload to storage
        $file = self::getStorage()->createFile($this->bucketId, ID::unique(), $inputFile);
        
        return $file['\\$id'];
    }
    
    /**
     * Get file as data URL for client consumption
     */
    public function getAsDataUrl(string $fileId, string $mimeType): string
    {
        $fileData = self::getStorage()->getFileDownload($this->bucketId, $fileId);
        $base64 = base64_encode($fileData);
        return "data:{$mimeType};base64,{$base64}";
    }
    
    /**
     * Get file preview URL
     */
    public function getPreviewUrl(string $fileId, ?int $width = null, ?int $height = null): string
    {
        return self::getStorage()->getFilePreview($this->bucketId, $fileId, $width, $height);
    }
    
    /**
     * Delete file
     */
    public function delete(string $fileId): void
    {
        self::getStorage()->deleteFile($this->bucketId, $fileId);
    }
    
    /**
     * Delete multiple files (for cleanup)
     */
    public function deleteMany(array $fileIds): void
    {
        foreach ($fileIds as $fileId) {
            try {
                self::getStorage()->deleteFile($this->bucketId, $fileId);
            } catch (\\Exception $e) {
                // Continue even if some files fail
            }
        }
    }
}
\`\`\`
`,

  go: `
## Storage Wrapper Template

Create a centralized storage helper at \`internal/storage/storage.go\`:

\`\`\`go
package storage

import (
    "encoding/base64"
    "fmt"
    "os"
    "strings"
    
    "github.com/appwrite/sdk-for-go/appwrite"
    "github.com/appwrite/sdk-for-go/file"
    "github.com/appwrite/sdk-for-go/id"
)

var (
    client   *appwrite.Client
    storage  *appwrite.Storage
    BucketID string
)

func init() {
    client = appwrite.NewClient()
    client.SetEndpoint(os.Getenv("APPWRITE_ENDPOINT"))
    client.SetProject(os.Getenv("APPWRITE_PROJECT_ID"))
    client.SetKey(os.Getenv("APPWRITE_API_KEY"))
    
    storage = appwrite.NewStorage(client)
    BucketID = os.Getenv("APPWRITE_BUCKET_ID")
}

// Upload file from base64 string, returns File ID only
func Upload(base64Data, fileName, mimeType string) (string, error) {
    // Strip data URL prefix if present
    if idx := strings.Index(base64Data, ";base64,"); idx != -1 {
        base64Data = base64Data[idx+8:]
    }
    
    // Decode base64 to bytes
    fileBytes, err := base64.StdEncoding.DecodeString(base64Data)
    if err != nil {
        return "", err
    }
    
    // Create InputFile
    inputFile := file.NewInputFile(fileBytes, fileName)
    
    // Upload to storage
    result, err := storage.CreateFile(BucketID, id.Unique(), inputFile)
    if err != nil {
        return "", err
    }
    
    return result.Id, nil
}

// GetAsDataUrl returns file as data URL for client consumption
func GetAsDataUrl(fileId, mimeType string) (string, error) {
    fileBytes, err := storage.GetFileDownload(BucketID, fileId)
    if err != nil {
        return "", err
    }
    
    base64Str := base64.StdEncoding.EncodeToString(fileBytes)
    return fmt.Sprintf("data:%s;base64,%s", mimeType, base64Str), nil
}

// GetPreviewUrl returns file preview URL
func GetPreviewUrl(fileId string, width, height int) string {
    return storage.GetFilePreview(BucketID, fileId, 
        storage.WithGetFilePreviewWidth(width),
        storage.WithGetFilePreviewHeight(height))
}

// Delete removes a file
func Delete(fileId string) error {
    _, err := storage.DeleteFile(BucketID, fileId)
    return err
}

// DeleteMany removes multiple files (for cleanup)
func DeleteMany(fileIds []string) {
    for _, fileId := range fileIds {
        _ = Delete(fileId) // Continue even if some fail
    }
}
\`\`\`
`,

  ruby: `
## Storage Wrapper Template

Create a centralized storage helper at \`lib/storage_service.rb\`:

\`\`\`ruby
require 'appwrite'
require 'base64'

module StorageService
  class << self
    def client
      @client ||= begin
        client = Appwrite::Client.new
        client
          .set_endpoint(ENV['APPWRITE_ENDPOINT'])
          .set_project(ENV['APPWRITE_PROJECT_ID'])
          .set_key(ENV['APPWRITE_API_KEY'])
        client
      end
    end
    
    def storage
      @storage ||= Appwrite::Storage.new(client)
    end
    
    def bucket_id
      ENV['APPWRITE_BUCKET_ID']
    end
  end
  
  class FileStorage
    # Upload file from base64 string, returns File ID only
    def upload(base64_data, file_name, mime_type)
      # Strip data URL prefix if present
      if base64_data.include?(';base64,')
        base64_data = base64_data.split(';base64,').last
      end
      
      # Decode base64 to bytes
      file_bytes = Base64.decode64(base64_data)
      
      # Create InputFile
      input_file = Appwrite::InputFile.from_bytes(file_bytes, file_name, mime_type)
      
      # Upload to storage
      result = StorageService.storage.create_file(
        bucket_id: StorageService.bucket_id,
        file_id: Appwrite::ID.unique,
        file: input_file
      )
      
      result['$id']
    end
    
    # Get file as data URL for client consumption
    def get_as_data_url(file_id, mime_type)
      file_bytes = StorageService.storage.get_file_download(
        bucket_id: StorageService.bucket_id,
        file_id: file_id
      )
      base64_str = Base64.strict_encode64(file_bytes)
      "data:#{mime_type};base64,#{base64_str}"
    end
    
    # Get file preview URL
    def get_preview_url(file_id, width: nil, height: nil)
      StorageService.storage.get_file_preview(
        bucket_id: StorageService.bucket_id,
        file_id: file_id,
        width: width,
        height: height
      )
    end
    
    # Delete file
    def delete(file_id)
      StorageService.storage.delete_file(
        bucket_id: StorageService.bucket_id,
        file_id: file_id
      )
    end
    
    # Delete multiple files (for cleanup)
    def delete_many(file_ids)
      file_ids.each do |file_id|
        delete(file_id)
      rescue StandardError
        # Continue even if some files fail
      end
    end
  end
end

# Convenience accessor
def file_storage
  @file_storage ||= StorageService::FileStorage.new
end
\`\`\`
`,

  dotnet: `
## Storage Wrapper Template

Create a centralized storage helper at \`Services/StorageService.cs\`:

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Appwrite;
using Appwrite.Services;

public class StorageService
{
    private static Client? _client;
    private static Storage? _storage;
    private static string BucketId => Environment.GetEnvironmentVariable("APPWRITE_BUCKET_ID")!;
    
    private static Client GetClient()
    {
        if (_client == null)
        {
            _client = new Client()
                .SetEndpoint(Environment.GetEnvironmentVariable("APPWRITE_ENDPOINT")!)
                .SetProject(Environment.GetEnvironmentVariable("APPWRITE_PROJECT_ID")!)
                .SetKey(Environment.GetEnvironmentVariable("APPWRITE_API_KEY")!);
        }
        return _client;
    }
    
    private static Storage GetStorage()
    {
        return _storage ??= new Storage(GetClient());
    }
    
    /// <summary>
    /// Upload file from base64 string
    /// </summary>
    /// <returns>File ID only (never store base64 in database)</returns>
    public static async Task<string> UploadAsync(string base64Data, string fileName, string mimeType)
    {
        // Strip data URL prefix if present
        if (base64Data.Contains(";base64,"))
        {
            base64Data = base64Data.Split(";base64,")[1];
        }
        
        // Decode base64 to bytes
        var fileBytes = Convert.FromBase64String(base64Data);
        
        // Create InputFile
        var inputFile = InputFile.FromBytes(fileBytes, fileName, mimeType);
        
        // Upload to storage
        var file = await GetStorage().CreateFile(
            bucketId: BucketId,
            fileId: ID.Unique(),
            file: inputFile
        );
        
        return file.Id;
    }
    
    /// <summary>
    /// Get file as data URL for client consumption
    /// </summary>
    public static async Task<string> GetAsDataUrlAsync(string fileId, string mimeType)
    {
        var fileBytes = await GetStorage().GetFileDownload(BucketId, fileId);
        var base64Str = Convert.ToBase64String(fileBytes);
        return $"data:{mimeType};base64,{base64Str}";
    }
    
    /// <summary>
    /// Get file preview URL
    /// </summary>
    public static string GetPreviewUrl(string fileId, int? width = null, int? height = null)
    {
        return GetStorage().GetFilePreview(BucketId, fileId, width: width, height: height);
    }
    
    /// <summary>
    /// Delete file
    /// </summary>
    public static async Task DeleteAsync(string fileId)
    {
        await GetStorage().DeleteFile(BucketId, fileId);
    }
    
    /// <summary>
    /// Delete multiple files (for cleanup)
    /// </summary>
    public static async Task DeleteManyAsync(IEnumerable<string> fileIds)
    {
        foreach (var fileId in fileIds)
        {
            try
            {
                await GetStorage().DeleteFile(BucketId, fileId);
            }
            catch
            {
                // Continue even if some files fail
            }
        }
    }
}
\`\`\`
`,

  dart: `
## Storage Wrapper Template

Create a centralized storage helper at \`lib/services/storage.dart\`:

\`\`\`dart
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:dart_appwrite/dart_appwrite.dart';

class AppwriteStorage {
  static Client? _client;
  static Storage? _storage;
  
  static String get bucketId => Platform.environment['APPWRITE_BUCKET_ID']!;
  
  static Client get client {
    _client ??= Client()
      .setEndpoint(Platform.environment['APPWRITE_ENDPOINT']!)
      .setProject(Platform.environment['APPWRITE_PROJECT_ID']!)
      .setKey(Platform.environment['APPWRITE_API_KEY']!);
    return _client!;
  }
  
  static Storage get storage {
    _storage ??= Storage(client);
    return _storage!;
  }
}

class FileStorageService {
  /// Upload file from base64 string
  /// Returns: File ID only (never store base64 in database)
  Future<String> upload(String base64Data, String fileName, String mimeType) async {
    // Strip data URL prefix if present
    if (base64Data.contains(';base64,')) {
      base64Data = base64Data.split(';base64,').last;
    }
    
    // Decode base64 to bytes
    final Uint8List fileBytes = base64Decode(base64Data);
    
    // Create InputFile
    final inputFile = InputFile.fromBytes(
      bytes: fileBytes,
      filename: fileName,
      contentType: mimeType,
    );
    
    // Upload to storage
    final file = await AppwriteStorage.storage.createFile(
      bucketId: AppwriteStorage.bucketId,
      fileId: ID.unique(),
      file: inputFile,
    );
    
    return file.\$id;
  }
  
  /// Get file as data URL for client consumption
  Future<String> getAsDataUrl(String fileId, String mimeType) async {
    final fileBytes = await AppwriteStorage.storage.getFileDownload(
      bucketId: AppwriteStorage.bucketId,
      fileId: fileId,
    );
    final base64Str = base64Encode(fileBytes);
    return 'data:$mimeType;base64,$base64Str';
  }
  
  /// Get file preview URL
  String getPreviewUrl(String fileId, {int? width, int? height}) {
    return AppwriteStorage.storage.getFilePreview(
      bucketId: AppwriteStorage.bucketId,
      fileId: fileId,
      width: width,
      height: height,
    ).toString();
  }
  
  /// Delete file
  Future<void> delete(String fileId) async {
    await AppwriteStorage.storage.deleteFile(
      bucketId: AppwriteStorage.bucketId,
      fileId: fileId,
    );
  }
  
  /// Delete multiple files (for cleanup)
  Future<void> deleteMany(List<String> fileIds) async {
    for (final fileId in fileIds) {
      try {
        await delete(fileId);
      } catch (_) {
        // Continue even if some files fail
      }
    }
  }
}

final fileStorage = FileStorageService();
\`\`\`
`,

  kotlin: `
## Storage Wrapper Template

Create a centralized storage helper at \`services/StorageService.kt\`:

\`\`\`kotlin
package com.example.services

import io.appwrite.Client
import io.appwrite.ID
import io.appwrite.models.File
import io.appwrite.services.Storage
import java.util.Base64

object AppwriteStorageService {
    val bucketId: String = System.getenv("APPWRITE_BUCKET_ID")
    
    val client: Client by lazy {
        Client()
            .setEndpoint(System.getenv("APPWRITE_ENDPOINT"))
            .setProject(System.getenv("APPWRITE_PROJECT_ID"))
            .setKey(System.getenv("APPWRITE_API_KEY"))
    }
    
    val storage: Storage by lazy { Storage(client) }
}

class FileStorageService {
    private val storage = AppwriteStorageService.storage
    private val bucketId = AppwriteStorageService.bucketId
    
    /**
     * Upload file from base64 string
     * @return File ID only (never store base64 in database)
     */
    suspend fun upload(base64Data: String, fileName: String, mimeType: String): String {
        // Strip data URL prefix if present
        val cleanBase64 = if (base64Data.contains(";base64,")) {
            base64Data.substringAfter(";base64,")
        } else {
            base64Data
        }
        
        // Decode base64 to bytes
        val fileBytes = Base64.getDecoder().decode(cleanBase64)
        
        // Upload to storage
        val file = storage.createFile(
            bucketId = bucketId,
            fileId = ID.unique(),
            file = io.appwrite.models.InputFile.fromBytes(fileBytes, fileName, mimeType)
        )
        
        return file.id
    }
    
    /**
     * Get file as data URL for client consumption
     */
    suspend fun getAsDataUrl(fileId: String, mimeType: String): String {
        val fileBytes = storage.getFileDownload(bucketId, fileId)
        val base64Str = Base64.getEncoder().encodeToString(fileBytes)
        return "data:\$mimeType;base64,\$base64Str"
    }
    
    /**
     * Get file preview URL
     */
    fun getPreviewUrl(fileId: String, width: Int? = null, height: Int? = null): String {
        return storage.getFilePreview(bucketId, fileId, width = width, height = height)
    }
    
    /**
     * Delete file
     */
    suspend fun delete(fileId: String) {
        storage.deleteFile(bucketId, fileId)
    }
    
    /**
     * Delete multiple files (for cleanup)
     */
    suspend fun deleteMany(fileIds: List<String>) {
        fileIds.forEach { fileId ->
            try {
                delete(fileId)
            } catch (_: Exception) {
                // Continue even if some files fail
            }
        }
    }
}

val fileStorage = FileStorageService()
\`\`\`
`,

  swift: `
## Storage Wrapper Template

Create a centralized storage helper at \`Services/StorageService.swift\`:

\`\`\`swift
import Appwrite
import Foundation

class AppwriteStorageService {
    static let shared = AppwriteStorageService()
    
    let client: Client
    let storage: Storage
    let bucketId: String
    
    private init() {
        client = Client()
            .setEndpoint(ProcessInfo.processInfo.environment["APPWRITE_ENDPOINT"]!)
            .setProject(ProcessInfo.processInfo.environment["APPWRITE_PROJECT_ID"]!)
            .setKey(ProcessInfo.processInfo.environment["APPWRITE_API_KEY"]!)
        
        storage = Storage(client)
        bucketId = ProcessInfo.processInfo.environment["APPWRITE_BUCKET_ID"] ?? ""
    }
}

class FileStorageService {
    private let storage = AppwriteStorageService.shared.storage
    private let bucketId = AppwriteStorageService.shared.bucketId
    
    /// Upload file from base64 string
    /// Returns: File ID only (never store base64 in database)
    func upload(base64Data: String, fileName: String, mimeType: String) async throws -> String {
        // Strip data URL prefix if present
        var cleanBase64 = base64Data
        if let range = base64Data.range(of: ";base64,") {
            cleanBase64 = String(base64Data[range.upperBound...])
        }
        
        // Decode base64 to bytes
        guard let fileData = Data(base64Encoded: cleanBase64) else {
            throw NSError(domain: "StorageService", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid base64 data"])
        }
        
        // Create InputFile
        let inputFile = InputFile.fromData(fileData, filename: fileName, mimeType: mimeType)
        
        // Upload to storage
        let file = try await storage.createFile(
            bucketId: bucketId,
            fileId: ID.unique(),
            file: inputFile
        )
        
        return file.id
    }
    
    /// Get file as data URL for client consumption
    func getAsDataUrl(fileId: String, mimeType: String) async throws -> String {
        let fileData = try await storage.getFileDownload(bucketId: bucketId, fileId: fileId)
        let base64Str = fileData.base64EncodedString()
        return "data:\\(mimeType);base64,\\(base64Str)"
    }
    
    /// Get file preview URL
    func getPreviewUrl(fileId: String, width: Int? = nil, height: Int? = nil) -> String {
        return storage.getFilePreview(
            bucketId: bucketId,
            fileId: fileId,
            width: width,
            height: height
        )
    }
    
    /// Delete file
    func delete(fileId: String) async throws {
        _ = try await storage.deleteFile(bucketId: bucketId, fileId: fileId)
    }
    
    /// Delete multiple files (for cleanup)
    func deleteMany(fileIds: [String]) async {
        for fileId in fileIds {
            do {
                try await delete(fileId: fileId)
            } catch {
                // Continue even if some files fail
            }
        }
    }
}

let fileStorage = FileStorageService()
\`\`\`
`
};

/**
 * Get storage wrapper template for a specific SDK
 * @param {string} sdk - SDK name (javascript, python, php, etc.)
 * @returns {string} Storage wrapper template
 */
export function getStorageWrapperTemplate(sdk) {
  // Map SDK names to template keys
  /** @type {Record<string, string>} */
  const sdkMap = {
    javascript: 'javascript',
    'react-native': 'javascript',
    python: 'python',
    php: 'php',
    go: 'go',
    flutter: 'dart',
    dart: 'dart',
    apple: 'swift',
    android: 'kotlin',
    swift: 'swift',
    kotlin: 'kotlin',
    ruby: 'ruby',
    dotnet: 'dotnet'
  };
  
  const templateKey = sdkMap[sdk] || 'javascript';
  /** @type {Record<string, string>} */
  const templates = storageWrapperTemplates;
  return templates[templateKey] || templates.javascript;
}

// Legacy export for backwards compatibility
export const storageWrapperTemplate = storageWrapperTemplates.javascript;

/**
 * Functions implementation pattern (language-agnostic)
 */
export const functionsPattern = `
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
| **Synchronous** | Immediate response needed | \`createExecution(functionId, body, async=false)\` |
| **Asynchronous** | Fire-and-forget, long tasks | \`createExecution(functionId, body, async=true)\` |
| **Scheduled** | Cron-based triggers | Configure in Console/appwrite.json |
| **Event-driven** | Database/storage triggers | Configure event subscriptions |

### Implementation Steps

1. **Initialize Functions service** with your SDK's client
2. **Call \`createExecution()\`** with:
   - \`functionId\`: The function's unique ID
   - \`body\`: JSON string of data to pass
   - \`async\`: Boolean for sync/async execution
   - \`path\`: Optional route path (default: "/")
   - \`method\`: HTTP method (GET, POST, etc.)
3. **Handle response**: Check \`status\` field for success/failure
4. **Parse \`responseBody\`** as JSON for the result

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
`;

/**
 * Messaging implementation pattern (language-agnostic)
 */
export const messagingPattern = `
## Messaging Integration Pattern

**Documentation:** [Messaging Overview](https://appwrite.io/docs/products/messaging)

### Message Types

| Type | Method | Use Case |
|------|--------|----------|
| **Email** | \`createEmail()\` | Transactional emails, notifications |
| **Push** | \`createPush()\` | Mobile/web push notifications |
| **SMS** | \`createSms()\` | Text messages, verification codes |

### Targeting Options

Messages can be sent to:
- **Users**: Array of user IDs (\`users\` parameter)
- **Targets**: Specific device/endpoint IDs (\`targets\` parameter)
- **Topics**: Broadcast to subscribers (\`topics\` parameter)

### Implementation Steps

1. **Initialize Messaging service** with your SDK's client (requires API key)
2. **Create message** using the appropriate method:
   - \`createEmail(messageId, subject, content, topics, users, targets, ...)\`
   - \`createPush(messageId, title, body, topics, users, targets, data)\`
   - \`createSms(messageId, content, topics, users, targets)\`
3. **Handle delivery status** by checking the returned message object

### Topic Subscriptions

- **Subscribe**: \`createSubscriber(topicId, subscriberId, targetId)\`
- **Unsubscribe**: \`deleteSubscriber(topicId, subscriberId)\`

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
`;

/**
 * Realtime implementation pattern (language-agnostic)
 */
export const realtimePattern = `
## Realtime Integration Pattern

**Documentation:** [Realtime Overview](https://appwrite.io/docs/products/realtime)

### Overview

Realtime subscriptions allow your app to receive live updates when data changes. Subscriptions run on the **client side** using the client SDK.

### Subscription Flow

1. **Initialize client** with endpoint and project ID
2. **Subscribe to channel(s)** using \`client.subscribe(channels, callback)\`
3. **Handle events** in the callback (create, update, delete)
4. **Unsubscribe** when component unmounts or no longer needed

### Realtime Channels Reference

| Channel Pattern | Description |
|-----------------|-------------|
| \`databases.[DB_ID].tables.[TABLE_ID].rows\` | All rows in table |
| \`databases.[DB_ID].tables.[TABLE_ID].rows.[ROW_ID]\` | Specific row |
| \`buckets.[BUCKET_ID].files\` | All files in bucket |
| \`buckets.[BUCKET_ID].files.[FILE_ID]\` | Specific file |
| \`account\` | Current user's account changes |
| \`teams\` | Team membership changes |
| \`teams.[TEAM_ID]\` | Specific team changes |

### Event Types

The callback receives an event object with:
- \`events\`: Array of event strings (e.g., \`databases.*.tables.*.rows.*.create\`)
- \`payload\`: The row/file/account data that changed

| Event | Triggered When |
|-------|----------------|
| \`*.create\` | New row/file created |
| \`*.update\` | Existing row/file updated |
| \`*.delete\` | Row/file deleted |

### Implementation Pattern

\`\`\`
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
\`\`\`

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
`;

/**
 * Sites deployment notes (primarily documentation reference)
 */
export const sitesPattern = `
## Sites Deployment Pattern

Appwrite Sites is a hosting platform for static and SSR applications. Configuration is primarily done through the Appwrite Console or CLI.

### Deployment Methods

1. **Git Integration** (Recommended)
   - Connect your repository in Appwrite Console
   - Automatic deployments on push to configured branch
   - See: [Deploy from Git](https://appwrite.io/docs/products/sites/deploy-from-git)

2. **CLI Deployment**
   - Use \`appwrite deploy\` command
   - See: [Deploy from CLI](https://appwrite.io/docs/products/sites/deploy-from-cli)

3. **Manual Upload**
   - Upload built assets directly
   - See: [Deploy Manually](https://appwrite.io/docs/products/sites/deploy-manually)

### Environment Variables

Configure in Appwrite Console under Site settings:
- \`APPWRITE_ENDPOINT\` - Your Appwrite endpoint
- \`APPWRITE_PROJECT_ID\` - Your project ID
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
`;

// ============================================================
// SERVER SDK PATTERNS
// ============================================================

/**
 * Python Server SDK implementation pattern
 */
export const pythonServerPattern = `
## Python Implementation Pattern

### Project Structure

\`\`\`
project/
├── app/
│   ├── __init__.py
│   ├── main.py           # Application entry point
│   ├── config.py         # Configuration
│   └── services/
│       ├── __init__.py
│       ├── appwrite.py   # Appwrite client singleton
│       ├── db.py         # Database wrapper
│       └── storage.py    # Storage wrapper
├── requirements.txt
└── .env
\`\`\`

### Appwrite Client Singleton

\`\`\`python
# app/services/appwrite.py
import os
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.services.storage import Storage
from appwrite.services.users import Users

client = Client()
client.set_endpoint(os.environ['APPWRITE_ENDPOINT'])
client.set_project(os.environ['APPWRITE_PROJECT_ID'])
client.set_key(os.environ['APPWRITE_API_KEY'])

tables_db = TablesDB(client)
storage = Storage(client)
users = Users(client)

DATABASE_ID = os.environ['APPWRITE_DATABASE_ID']
BUCKET_ID = os.environ.get('APPWRITE_BUCKET_ID', '')
\`\`\`

### Database Wrapper

\`\`\`python
# app/services/db.py
from typing import TypeVar, Generic, Optional, List
from appwrite.query import Query
from appwrite.id import ID
from .appwrite import databases, DATABASE_ID

T = TypeVar('T')

class Table(Generic[T]):
    def __init__(self, table_id: str):
        self.table_id = table_id
    
    def create(self, data: dict) -> T:
        """Create row with auto-generated ID"""
        doc = tablesDB.create_row(
            DATABASE_ID,
            self.table_id,
            ID.unique(),
            data
        )
        return doc
    
    def get(self, row_id: str) -> Optional[T]:
        """Get row by ID"""
        try:
            return tablesDB.get_row(
                DATABASE_ID,
                self.table_id,
                row_id
            )
        except Exception:
            return None
    
    def list_by_owner(self, user_id: str) -> List[T]:
        """List rows by owner"""
        result = tablesDB.list_rows(
            DATABASE_ID,
            self.table_id,
            [
                Query.equal('createdBy', user_id),
                Query.order_desc('$createdAt')
            ]
        )
        return result['rows']
    
    def list_by_team(self, team_id: str) -> List[T]:
        """List rows by team"""
        result = tablesDB.list_rows(
            DATABASE_ID,
            self.table_id,
            [
                Query.equal('teamId', team_id),
                Query.order_desc('$createdAt')
            ]
        )
        return result['rows']
    
    def update(self, row_id: str, data: dict) -> T:
        """Update row (removes immutable columns)"""
        safe_data = {k: v for k, v in data.items() 
                     if k not in ('$id', '$createdAt', '$updatedAt', 'createdBy', 'teamId')}
        return tablesDB.update_row(
            DATABASE_ID,
            self.table_id,
            row_id,
            safe_data
        )
    
    def delete(self, row_id: str) -> None:
        """Delete row"""
        tablesDB.delete_row(DATABASE_ID, self.table_id, row_id)


# Export typed tables
items = Table('items')
projects = Table('projects')
\`\`\`

### Flask Integration Example

\`\`\`python
# app/main.py
from flask import Flask, request, jsonify, g
from functools import wraps
from app.services import db
from app.services.appwrite import users

app = Flask(__name__)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        session = request.cookies.get('session')
        if not session:
            return jsonify({'error': 'Unauthorized'}), 401
        
        try:
            # Verify session and get user
            user = users.get(session)  # Or use session client
            g.user = user
        except Exception:
            return jsonify({'error': 'Invalid session'}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/api/items', methods=['GET'])
@require_auth
def list_items():
    items_list = db.items.list_by_owner(g.user['$id'])
    return jsonify({'items': items_list})

@app.route('/api/items', methods=['POST'])
@require_auth
def create_item():
    data = request.get_json()
    
    item = db.items.create({
        'title': data['title'].strip(),
        'description': data.get('description'),
        'createdBy': g.user['$id'],
        'teamId': data.get('teamId')
    })
    
    return jsonify({'item': item}), 201
\`\`\`

### Environment Variables

Required in \`.env\`:
\`\`\`
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_BUCKET_ID=your-bucket-id
\`\`\`
`;

/**
 * PHP Server SDK implementation pattern
 */
export const phpServerPattern = `
## PHP Implementation Pattern

### Project Structure

\`\`\`
project/
├── src/
│   ├── Services/
│   │   ├── AppwriteService.php   # Client singleton
│   │   ├── DatabaseService.php   # Database wrapper
│   │   └── StorageService.php    # Storage wrapper
│   └── Middleware/
│       └── AuthMiddleware.php
├── public/
│   └── index.php
├── composer.json
└── .env
\`\`\`

### Appwrite Client Service

\`\`\`php
<?php
// src/Services/AppwriteService.php
namespace App\\Services;

use Appwrite\\Client;
use Appwrite\\Services\\TablesDB;
use Appwrite\\Services\\Storage;
use Appwrite\\Services\\Users;

class AppwriteService
{
    private static ?Client $client = null;
    private static ?TablesDB $tablesDB = null;
    private static ?Storage $storage = null;
    
    public static function getClient(): Client
    {
        if (self::$client === null) {
            self::$client = new Client();
            self::$client
                ->setEndpoint($_ENV['APPWRITE_ENDPOINT'])
                ->setProject($_ENV['APPWRITE_PROJECT_ID'])
                ->setKey($_ENV['APPWRITE_API_KEY']);
        }
        return self::$client;
    }
    
    public static function getTablesDB(): TablesDB
    {
        if (self::$tablesDB === null) {
            self::$tablesDB = new TablesDB(self::getClient());
        }
        return self::$tablesDB;
    }
    
    public static function getStorage(): Storage
    {
        if (self::$storage === null) {
            self::$storage = new Storage(self::getClient());
        }
        return self::$storage;
    }
}
\`\`\`

### Database Wrapper

\`\`\`php
<?php
// src/Services/DatabaseService.php
namespace App\\Services;

use Appwrite\\ID;
use Appwrite\\Query;

class DatabaseService
{
    private string $databaseId;
    private TablesDB $tablesDB;

    public function __construct()
    {
        $this->databaseId = $_ENV['APPWRITE_DATABASE_ID'];
        $this->tablesDB = AppwriteService::getTablesDB();
    }
    
    public function create(string $tableId, array $data): array
    {
        return $this->tablesDB->createRow(
            $this->databaseId,
            $tableId,
            ID::unique(),
            $data
        );
    }
    
    public function get(string $tableId, string $rowId): ?array
    {
        try {
            return $this->tablesDB->getRow(
                $this->databaseId,
                $tableId,
                $rowId
            );
        } catch (\\Exception $e) {
            return null;
        }
    }
    
    public function listByOwner(string $tableId, string $userId): array
    {
        $result = $this->tablesDB->listRows(
            $this->databaseId,
            $tableId,
            [
                Query::equal('createdBy', [$userId]),
                Query::orderDesc('\\$createdAt')
            ]
        );
        return $result['rows'];
    }
    
    public function listByTeam(string $tableId, string $teamId): array
    {
        $result = $this->tablesDB->listRows(
            $this->databaseId,
            $tableId,
            [
                Query::equal('teamId', [$teamId]),
                Query::orderDesc('\\$createdAt')
            ]
        );
        return $result['rows'];
    }
    
    public function update(string $tableId, string $rowId, array $data): array
    {
        // Remove immutable columns
        unset($data['\\$id'], $data['\\$createdAt'], $data['\\$updatedAt'], 
              $data['createdBy'], $data['teamId']);
        
        return $this->tablesDB->updateRow(
            $this->databaseId,
            $tableId,
            $rowId,
            $data
        );
    }
    
    public function delete(string $tableId, string $rowId): void
    {
        $this->tablesDB->deleteRow(
            $this->databaseId,
            $tableId,
            $rowId
        );
    }
}
\`\`\`

### Laravel Integration Example

\`\`\`php
<?php
// app/Http/Controllers/ItemController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Services\\DatabaseService;

class ItemController extends Controller
{
    private DatabaseService $db;
    
    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }
    
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $items = $this->db->listByOwner('items', $userId);
        
        return response()->json(['items' => $items]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:120',
            'teamId' => 'nullable|string'
        ]);
        
        $item = $this->db->create('items', [
            'title' => trim($validated['title']),
            'description' => null,
            'createdBy' => $request->user()->id,
            'teamId' => $validated['teamId'] ?? null
        ]);
        
        return response()->json(['item' => $item], 201);
    }
    
    public function destroy(Request $request, string $id)
    {
        $item = $this->db->get('items', $id);
        
        if (!$item || $item['createdBy'] !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        $this->db->delete('items', $id);
        
        return response()->json(['success' => true]);
    }
}
\`\`\`
`;

/**
 * Go Server SDK implementation pattern
 */
export const goServerPattern = `
## Go Implementation Pattern

### Project Structure

\`\`\`
project/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── appwrite/
│   │   ├── client.go      # Client singleton
│   │   ├── db.go          # Database wrapper
│   │   └── storage.go     # Storage wrapper
│   ├── handlers/
│   │   └── items.go
│   └── middleware/
│       └── auth.go
├── go.mod
└── .env
\`\`\`

### Appwrite Client

\`\`\`go
// internal/appwrite/client.go
package appwrite

import (
    "os"
    "sync"
    
    "github.com/appwrite/sdk-for-go/appwrite"
)

var (
    client   *appwrite.Client
    once     sync.Once
    
    DatabaseID string
    BucketID   string
)

func GetClient() *appwrite.Client {
    once.Do(func() {
        client = appwrite.NewClient()
        client.SetEndpoint(os.Getenv("APPWRITE_ENDPOINT"))
        client.SetProject(os.Getenv("APPWRITE_PROJECT_ID"))
        client.SetKey(os.Getenv("APPWRITE_API_KEY"))
        
        DatabaseID = os.Getenv("APPWRITE_DATABASE_ID")
        BucketID = os.Getenv("APPWRITE_BUCKET_ID")
    })
    return client
}

func GetTablesDB() *appwrite.TablesDB {
    return appwrite.NewTablesDB(GetClient())
}

func GetStorage() *appwrite.Storage {
    return appwrite.NewStorage(GetClient())
}
\`\`\`

### Database Wrapper

\`\`\`go
// internal/appwrite/db.go
package appwrite

import (
    "github.com/appwrite/sdk-for-go/appwrite"
    "github.com/appwrite/sdk-for-go/id"
    "github.com/appwrite/sdk-for-go/query"
)

type Table struct {
    ID string
    db *appwrite.TablesDB
}

func NewTable(tableID string) *Table {
    return &Table{
        ID: tableID,
        db: GetTablesDB(),
    }
}

func (c *Table) Create(data map[string]interface{}) (map[string]interface{}, error) {
    doc, err := c.db.CreateRow(
        DatabaseID,
        c.ID,
        id.Unique(),
        data,
    )
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) Get(rowID string) (map[string]interface{}, error) {
    doc, err := c.db.GetRow(DatabaseID, c.ID, rowID)
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) ListByOwner(userID string) ([]map[string]interface{}, error) {
    result, err := c.db.ListRows(
        DatabaseID,
        c.ID,
        c.db.WithListRowsQueries([]string{
            query.Equal("createdBy", userID),
            query.OrderDesc("$createdAt"),
        }),
    )
    if err != nil {
        return nil, err
    }
    
    docs := make([]map[string]interface{}, len(result.Rows))
    for i, doc := range result.Rows {
        docs[i] = doc.ToMap()
    }
    return docs, nil
}

func (c *Table) ListByTeam(teamID string) ([]map[string]interface{}, error) {
    result, err := c.db.ListRows(
        DatabaseID,
        c.ID,
        c.db.WithListRowsQueries([]string{
            query.Equal("teamId", teamID),
            query.OrderDesc("$createdAt"),
        }),
    )
    if err != nil {
        return nil, err
    }
    
    docs := make([]map[string]interface{}, len(result.Rows))
    for i, doc := range result.Rows {
        docs[i] = doc.ToMap()
    }
    return docs, nil
}

func (c *Table) Update(rowID string, data map[string]interface{}) (map[string]interface{}, error) {
    // Remove immutable columns
    delete(data, "$id")
    delete(data, "$createdAt")
    delete(data, "$updatedAt")
    delete(data, "createdBy")
    delete(data, "teamId")
    
    doc, err := c.db.UpdateRow(DatabaseID, c.ID, rowID, data)
    if err != nil {
        return nil, err
    }
    return doc.ToMap(), nil
}

func (c *Table) Delete(rowID string) error {
    _, err := c.db.DeleteRow(DatabaseID, c.ID, rowID)
    return err
}

// Exported tables
var (
    Items    = NewTable("items")
    Projects = NewTable("projects")
)
\`\`\`

### HTTP Handler Example

\`\`\`go
// internal/handlers/items.go
package handlers

import (
    "encoding/json"
    "net/http"
    "strings"
    
    "yourproject/internal/appwrite"
    "yourproject/internal/middleware"
)

func ListItems(w http.ResponseWriter, r *http.Request) {
    user := middleware.GetUser(r.Context())
    
    items, err := appwrite.Items.ListByOwner(user.ID)
    if err != nil {
        http.Error(w, "Failed to fetch items", http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(map[string]interface{}{"items": items})
}

func CreateItem(w http.ResponseWriter, r *http.Request) {
    user := middleware.GetUser(r.Context())
    
    var input struct {
        Title  string  \`json:"title"\`
        TeamID *string \`json:"teamId"\`
    }
    
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    item, err := appwrite.Items.Create(map[string]interface{}{
        "title":       strings.TrimSpace(input.Title),
        "description": nil,
        "createdBy":   user.ID,
        "teamId":      input.TeamID,
    })
    if err != nil {
        http.Error(w, "Failed to create item", http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]interface{}{"item": item})
}
\`\`\`
`;

/**
 * Ruby Server SDK implementation pattern
 */
export const rubyServerPattern = `
## Ruby Implementation Pattern

### Project Structure

\`\`\`
project/
├── lib/
│   ├── appwrite_client.rb   # Client singleton
│   ├── database_service.rb  # Database wrapper
│   └── storage_service.rb   # Storage wrapper
├── app/
│   └── controllers/
│       └── items_controller.rb
├── Gemfile
└── .env
\`\`\`

### Appwrite Client

\`\`\`ruby
# lib/appwrite_client.rb
require 'appwrite'

module AppwriteClient
  class << self
    def client
      @client ||= begin
        client = Appwrite::Client.new
        client
          .set_endpoint(ENV['APPWRITE_ENDPOINT'])
          .set_project(ENV['APPWRITE_PROJECT_ID'])
          .set_key(ENV['APPWRITE_API_KEY'])
        client
      end
    end
    
    def tables_db
      @tables_db ||= Appwrite::TablesDB.new(client)
    end
    
    def storage
      @storage ||= Appwrite::Storage.new(client)
    end
    
    def database_id
      ENV['APPWRITE_DATABASE_ID']
    end
    
    def bucket_id
      ENV['APPWRITE_BUCKET_ID']
    end
  end
end
\`\`\`

### Database Service

\`\`\`ruby
# lib/database_service.rb
require_relative 'appwrite_client'

class DatabaseService
  def initialize(table_id)
    @table_id = table_id
    @tables_db = AppwriteClient.tables_db
    @database_id = AppwriteClient.database_id
  end
  
  def create(data)
    @tables_db.create_row(
      database_id: @database_id,
      table_id: @table_id,
      row_id: Appwrite::ID.unique,
      data: data
    )
  end
  
  def get(row_id)
    @tables_db.et_row(
      database_id: @database_id,
      table_id: @table_id,
      row_id: row_id
    )
  rescue Appwrite::Exception
    nil
  end
  
  def list_by_owner(user_id)
    result = @tables_db.list_rows(
      database_id: @database_id,
      table_id: @table_id,
      queries: [
        Appwrite::Query.equal('createdBy', [user_id]),
        Appwrite::Query.order_desc('$createdAt')
      ]
    )
    result.rows
  end
  
  def list_by_team(team_id)
    result = @tables_db.list_rows(
      database_id: @database_id,
      table_id: @table_id,
      queries: [
        Appwrite::Query.equal('teamId', [team_id]),
        Appwrite::Query.order_desc('$createdAt')
      ]
    )
    result.rows
  end
  
  def update(row_id, data)
    # Remove immutable fields
    safe_data = data.except('$id', '$createdAt', '$updatedAt', 'createdBy', 'teamId')
    
    @tables_db.update_row(
      database_id: @database_id,
      table_id: @table_id,
      row_id: row_id,
      data: safe_data
    )
  end
  
  def delete(row_id)
    @tables_db.delete_row(
      database_id: @database_id,
      table_id: @table_id,
      row_id: row_id
    )
  end
end

# Convenience accessors
module DB
  def self.items
    @items ||= DatabaseService.new('items')
  end
  
  def self.projects
    @projects ||= DatabaseService.new('projects')
  end
end
\`\`\`

### Rails Controller Example

\`\`\`ruby
# app/controllers/items_controller.rb
class ItemsController < ApplicationController
  before_action :authenticate_user!
  
  def index
    items = DB.items.list_by_owner(current_user.id)
    render json: { items: items }
  end
  
  def create
    item = DB.items.create(
      title: params[:title].strip,
      description: nil,
      createdBy: current_user.id,
      teamId: params[:team_id]
    )
    
    render json: { item: item }, status: :created
  end
  
  def destroy
    item = DB.items.get(params[:id])
    
    if item.nil? || item['createdBy'] != current_user.id
      return render json: { error: 'Forbidden' }, status: :forbidden
    end
    
    DB.items.delete(params[:id])
    render json: { success: true }
  end
end
\`\`\`
`;

/**
 * .NET Server SDK implementation pattern
 */
export const dotnetServerPattern = `
## .NET Implementation Pattern

### Project Structure

\`\`\`
Project/
├── Services/
│   ├── AppwriteService.cs    # Client singleton
│   ├── DatabaseService.cs    # Database wrapper
│   └── StorageService.cs     # Storage wrapper
├── Controllers/
│   └── ItemsController.cs
├── Models/
│   └── Item.cs
├── Program.cs
├── appsettings.json
└── .env
\`\`\`

### Appwrite Service

\`\`\`csharp
// Services/AppwriteService.cs
using Appwrite;
using Appwrite.Services;

public class AppwriteService
{
    private static Client? _client;
    private static TablesDB? _tablesDB;
    private static Storage? _storage;
    
    public static string DatabaseId => Environment.GetEnvironmentVariable("APPWRITE_DATABASE_ID")!;
    public static string BucketId => Environment.GetEnvironmentVariable("APPWRITE_BUCKET_ID")!;
    
    public static Client GetClient()
    {
        if (_client == null)
        {
            _client = new Client()
                .SetEndpoint(Environment.GetEnvironmentVariable("APPWRITE_ENDPOINT")!)
                .SetProject(Environment.GetEnvironmentVariable("APPWRITE_PROJECT_ID")!)
                .SetKey(Environment.GetEnvironmentVariable("APPWRITE_API_KEY")!);
        }
        return _client;
    }
    
    public static TablesDB GetTablesDB()
    {
        return _tablesDB ??= new TablesDB(GetClient());
    }
    
    public static Storage GetStorage()
    {
        return _storage ??= new Storage(GetClient());
    }
}
\`\`\`

### Database Service

\`\`\`csharp
// Services/DatabaseService.cs
using Appwrite;
using Appwrite.Services;
using Appwrite.Models;
using System.Text.Json;

public class DatabaseService<T> where T : class
{
private readonly string _tableId;
    private readonly TablesDB _tablesDB;

    public DatabaseService(string tableId)
    {
        _tableId = tableId;
        _tablesDB = AppwriteService.GetTablesDB();
    }
    
    public async Task<Row> CreateAsync(Dictionary<string, object> data)
    {
        return await _tablesDB.CreateRow(
            databaseId: AppwriteService.DatabaseId,
            tableId: _tableId,
            rowId: ID.Unique(),
            data: data
        );
    }
    
    public async Task<Row?> GetAsync(string rowId)
    {
        try
        {
            return await _tablesDB.GetRow(
                databaseId: AppwriteService.DatabaseId,
                tableId: _tableId,
                rowId: rowId
            );
        }
        catch (AppwriteException)
        {
            return null;
        }
    }
    
    public async Task<List<Row>> ListByOwnerAsync(string userId)
    {
        var result = await _tablesDB.ListRows(
            databaseId: AppwriteService.DatabaseId,
            tableId: _tableId,
            queries: new List<string>
            {
                Query.Equal("createdBy", new List<string> { userId }),
                Query.OrderDesc("$createdAt")
            }
        );
        return result.Rows;
    }
    
    public async Task<List<Row>> ListByTeamAsync(string teamId)
    {
        var result = await _tablesDB.ListRows(
            databaseId: AppwriteService.DatabaseId,
            tableId: _tableId,
            queries: new List<string>
            {
                Query.Equal("teamId", new List<string> { teamId }),
                Query.OrderDesc("$createdAt")
            }
        );
        return result.Rows;
    }
    
    public async Task<Row> UpdateAsync(string rowId, Dictionary<string, object> data)
    {
        // Remove immutable columns
        data.Remove("$id");
        data.Remove("$createdAt");
        data.Remove("$updatedAt");
        data.Remove("createdBy");
        data.Remove("teamId");
        
        return await _tablesDB.UpdateRow(
            databaseId: AppwriteService.DatabaseId,
            tableId: _tableId,
            rowId: rowId,
            data: data
        );
    }
    
    public async Task DeleteAsync(string rowId)
    {
        await _tablesDB.DeleteRow(
            databaseId: AppwriteService.DatabaseId,
            tableId: _tableId,
            rowId: rowId
        );
    }
}

// Static accessors
public static class DB
{
    public static DatabaseService<Item> Items { get; } = new("items");
    public static DatabaseService<Project> Projects { get; } = new("projects");
}
\`\`\`

### Controller Example

\`\`\`csharp
// Controllers/ItemsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var userId = User.FindFirst("sub")?.Value!;
        var items = await DB.Items.ListByOwnerAsync(userId);
        return Ok(new { items });
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemRequest request)
    {
        var userId = User.FindFirst("sub")?.Value!;
        
        var item = await DB.Items.CreateAsync(new Dictionary<string, object>
        {
            { "title", request.Title.Trim() },
            { "description", null! },
            { "createdBy", userId },
            { "teamId", request.TeamId ?? null! }
        });
        
        return CreatedAtAction(nameof(GetItems), new { item });
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(string id)
    {
        var userId = User.FindFirst("sub")?.Value!;
        var item = await DB.Items.GetAsync(id);
        
        if (item == null || item.Data["createdBy"].ToString() != userId)
        {
            return Forbid();
        }
        
        await DB.Items.DeleteAsync(id);
        return Ok(new { success = true });
    }
}

public record CreateItemRequest(string Title, string? TeamId);
\`\`\`
`;

/**
 * Dart Server SDK implementation pattern
 */
export const dartServerPattern = `
## Dart Server Implementation Pattern

### Project Structure

\`\`\`
project/
├── bin/
│   └── server.dart           # Entry point
├── lib/
│   ├── services/
│   │   ├── appwrite.dart     # Client singleton
│   │   ├── database.dart     # Database wrapper
│   │   └── storage.dart      # Storage wrapper
│   └── handlers/
│       └── items.dart
├── pubspec.yaml
└── .env
\`\`\`

### Appwrite Client

\`\`\`dart
// lib/services/appwrite.dart
import 'dart:io';
import 'package:dart_appwrite/dart_appwrite.dart';

class AppwriteService {
  static Client? _client;
  static TablesDB? _tablesDB;
  static Storage? _storage;
  
  static String get databaseId => Platform.environment['APPWRITE_DATABASE_ID']!;
  static String get bucketId => Platform.environment['APPWRITE_BUCKET_ID']!;
  
  static Client get client {
    _client ??= Client()
      .setEndpoint(Platform.environment['APPWRITE_ENDPOINT']!)
      .setProject(Platform.environment['APPWRITE_PROJECT_ID']!)
      .setKey(Platform.environment['APPWRITE_API_KEY']!);
    return _client!;
  }
  
  static TablesDB get tablesDB {
    _tablesDB ??= TablesDB(client);
    return _tablesDB!;
  }
  
  static Storage get storage {
    _storage ??= Storage(client);
    return _storage!;
  }
}
\`\`\`

### Database Wrapper

\`\`\`dart
// lib/services/database.dart
import 'package:dart_appwrite/dart_appwrite.dart';
import 'appwrite.dart';

class Table<T> {
  final String tableId;
  
  Table(this.tableId);
  
  Future<Row> create(Map<String, dynamic> data) async {
    return await AppwriteService.tablesDB.createRow(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: ID.unique(),
      data: data,
    );
  }
  
  Future<Row?> get(String rowId) async {
    try {
      return await AppwriteService.tablesDB.getRow(
        databaseId: AppwriteService.databaseId,
        tableId: tableId,
        rowId: rowId,
      );
    } on AppwriteException {
      return null;
    }
  }
  
  Future<List<Row>> listByOwner(String userId) async {
    final result = await AppwriteService.tablesDB.listRows(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      queries: [
        Query.equal('createdBy', userId),
        Query.orderDesc(r'$createdAt'),
      ],
    );
    return result.rows;
  }
  
  Future<List<Row>> listByTeam(String teamId) async {
    final result = await AppwriteService.tablesDB.ws(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      queries: [
        Query.equal('teamId', teamId),
        Query.orderDesc(r'$createdAt'),
      ],
    );
    return result.rows;
  }
  
  Future<Row> update(String rowId, Map<String, dynamic> data) async {
    // Remove immutable columns
    data.remove(r'$id');
    data.remove(r'$createdAt');
    data.remove(r'$updatedAt');
    data.remove('createdBy');
    data.remove('teamId');
    
    return await AppwriteService.tablesDB.w(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: rowId,
      data: data,
    );
  }
  
  Future<void> delete(String rowId) async {
    await AppwriteService.tablesDB.eteRow(
      databaseId: AppwriteService.databaseId,
      tableId: tableId,
      rowId: rowId,
    );
  }
}

// Exported tables
final items = Table<dynamic>('items');
final projects = Table<dynamic>('projects');
\`\`\`

### Shelf Handler Example

\`\`\`dart
// lib/handlers/items.dart
import 'dart:convert';
import 'package:shelf/shelf.dart';
import '../services/database.dart';

Response jsonResponse(Object data, {int statusCode = 200}) {
  return Response(
    statusCode,
    body: jsonEncode(data),
    headers: {'content-type': 'application/json'},
  );
}

Future<Response> listItems(Request request) async {
  final userId = request.context['userId'] as String;
  
  final itemsList = await items.listByOwner(userId);
  final itemsData = itemsList.map((doc) => doc.data).toList();
  
  return jsonResponse({'items': itemsData});
}

Future<Response> createItem(Request request) async {
  final userId = request.context['userId'] as String;
  final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
  
  final item = await items.create({
    'title': (body['title'] as String).trim(),
    'description': null,
    'createdBy': userId,
    'teamId': body['teamId'],
  });
  
  return jsonResponse({'item': item.data}, statusCode: 201);
}

Future<Response> deleteItem(Request request, String id) async {
  final userId = request.context['userId'] as String;
  
  final item = await items.get(id);
  if (item == null || item.data['createdBy'] != userId) {
    return jsonResponse({'error': 'Forbidden'}, statusCode: 403);
  }
  
  await items.delete(id);
  return jsonResponse({'success': true});
}
\`\`\`
`;

/**
 * Kotlin Server SDK implementation pattern
 */
export const kotlinServerPattern = `
## Kotlin Server Implementation Pattern

### Project Structure

\`\`\`
project/
├── src/main/kotlin/
│   ├── Application.kt
│   ├── services/
│   │   ├── AppwriteService.kt
│   │   ├── DatabaseService.kt
│   │   └── StorageService.kt
│   └── routes/
│       └── ItemRoutes.kt
├── build.gradle.kts
└── .env
\`\`\`

### Appwrite Service

\`\`\`kotlin
// services/AppwriteService.kt
package com.example.services

import io.appwrite.Client
import io.appwrite.services.TablesDB
import io.appwrite.services.Storage

object AppwriteService {
    val databaseId: String = System.getenv("APPWRITE_DATABASE_ID")
    val bucketId: String = System.getenv("APPWRITE_BUCKET_ID")
    
    val client: Client by lazy {
        Client()
            .setEndpoint(System.getenv("APPWRITE_ENDPOINT"))
            .setProject(System.getenv("APPWRITE_PROJECT_ID"))
            .setKey(System.getenv("APPWRITE_API_KEY"))
    }
    
    val tablesDB: TablesDB by lazy { TablesDB(client) }
    val storage: Storage by lazy { Storage(client) }
}
\`\`\`

### Database Service

\`\`\`kotlin
// services/DatabaseService.kt
package com.example.services

import io.appwrite.ID
import io.appwrite.Query
import io.appwrite.models.Row

class Table(private val tableId: String) {
    private val tablesDB = AppwriteService.tablesDB
    private val databaseId = AppwriteService.databaseId
    
    suspend fun create(data: Map<String, Any?>): Row<Map<String, Any>> {
        return tablesDB.createRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = ID.unique(),
            data = data
        )
    }
    
    suspend fun get(rowId: String): Row<Map<String, Any>>? {
        return try {
            tablesDB.etRow(
                databaseId = databaseId,
                tableId = tableId,
                rowId = rowId
            )
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun listByOwner(userId: String): List<Row<Map<String, Any>>> {
        val result = tablesDB.tRows(
            databaseId = databaseId,
            tableId = tableId,
            queries = listOf(
                Query.equal("createdBy", listOf(userId)),
                Query.orderDesc("\$createdAt")
            )
        )
        return result.rows
    }
    
    suspend fun listByTeam(teamId: String): List<Row<Map<String, Any>>> {
        val result = tablesDB.listRows(
            databaseId = databaseId,
            tableId = tableId,
            queries = listOf(
                Query.equal("teamId", listOf(teamId)),
                Query.orderDesc("\$createdAt")
            )
        )
        return result.rows
    }
    
    suspend fun update(rowId: String, data: Map<String, Any?>): Row<Map<String, Any>> {
        // Remove immutable columns
        val safeData = data.filterKeys { 
            it !in listOf("\$id", "\$createdAt", "\$updatedAt", "createdBy", "teamId")
        }
        
        return tablesDB.updateRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = rowId,
            data = safeData
        )
    }
    
    suspend fun delete(rowId: String) {
        tablesDB.deleteRow(
            databaseId = databaseId,
            tableId = tableId,
            rowId = rowId
        )
    }
}

// Exported tables
object DB {
    val items = Table("items")
    val projects = Table("projects")
}
\`\`\`

### Ktor Routes Example

\`\`\`kotlin
// routes/ItemRoutes.kt
package com.example.routes

import com.example.services.DB
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.itemRoutes() {
    authenticate {
        route("/api/items") {
            get {
                val userId = call.principal<UserPrincipal>()!!.id
                val items = DB.items.listByOwner(userId)
                call.respond(mapOf("items" to items.map { it.data }))
            }
            
            post {
                val userId = call.principal<UserPrincipal>()!!.id
                val request = call.receive<CreateItemRequest>()
                
                val item = DB.items.create(mapOf(
                    "title" to request.title.trim(),
                    "description" to null,
                    "createdBy" to userId,
                    "teamId" to request.teamId
                ))
                
                call.respond(HttpStatusCode.Created, mapOf("item" to item.data))
            }
            
            delete("/{id}") {
                val userId = call.principal<UserPrincipal>()!!.id
                val id = call.parameters["id"]!!
                
                val item = DB.items.get(id)
                if (item == null || item.data["createdBy"] != userId) {
                    call.respond(HttpStatusCode.Forbidden, mapOf("error" to "Forbidden"))
                    return@delete
                }
                
                DB.items.delete(id)
                call.respond(mapOf("success" to true))
            }
        }
    }
}

data class CreateItemRequest(val title: String, val teamId: String?)
\`\`\`
`;

/**
 * Swift Server SDK implementation pattern
 */
export const swiftServerPattern = `
## Swift Server Implementation Pattern

### Project Structure

\`\`\`
Project/
├── Sources/
│   └── App/
│       ├── main.swift
│       ├── Services/
│       │   ├── AppwriteService.swift
│       │   ├── DatabaseService.swift
│       │   └── StorageService.swift
│       └── Controllers/
│           └── ItemController.swift
├── Package.swift
└── .env
\`\`\`

### Appwrite Service

\`\`\`swift
// Services/AppwriteService.swift
import Appwrite
import Foundation

class AppwriteService {
    static let shared = AppwriteService()
    
    let client: Client
    let tablesDB: TablesDB
    let storage: Storage
    
    let databaseId: String
    let bucketId: String
    
    private init() {
        client = Client()
            .setEndpoint(ProcessInfo.processInfo.environment["APPWRITE_ENDPOINT"]!)
            .setProject(ProcessInfo.processInfo.environment["APPWRITE_PROJECT_ID"]!)
.setKey(ProcessInfo.processInfo.environment["APPWRITE_API_KEY"]!)

        tablesDB = TablesDB(client)
        storage = Storage(client)
        
        databaseId = ProcessInfo.processInfo.environment["APPWRITE_DATABASE_ID"]!
        bucketId = ProcessInfo.processInfo.environment["APPWRITE_BUCKET_ID"] ?? ""
    }
}
\`\`\`

### Database Service

\`\`\`swift
// Services/DatabaseService.swift
import Appwrite
import Foundation

class Table {
    let tableId: String
    private let tablesDB: TablesDB
    private let databaseId: String
    
    init(_ tableId: String) {
        self.tableId = tableId
        self.tablesDB = AppwriteService.shared.tablesDB
        self.databaseId = AppwriteService.shared.databaseId
    }
    
    func create(data: [String: Any]) async throws -> Row<[String: AnyCodable]> {
        return try await tablesDB.createRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: ID.unique(),
            data: data
        )
    }
    
    func get(rowId: String) async throws -> Row<[String: AnyCodable]>? {
        do {
            return try await tablesDB.getRow(
                databaseId: databaseId,
                tableId: tableId,
                rowId: rowId
            )
        } catch {
            return nil
        }
    }
    
    func listByOwner(userId: String) async throws -> [Row<[String: AnyCodable]>] {
        let result = try await tablesDB.listRows(
            databaseId: databaseId,
            tableId: tableId,
            queries: [
                Query.equal("createdBy", value: userId),
                Query.orderDesc("$createdAt")
            ]
        )
        return result.rows
    }
    
    func listByTeam(teamId: String) async throws -> [Row<[String: AnyCodable]>] {
        let result = try await tablesDB.listRows(
            databaseId: databaseId,
            tableId: tableId,
            queries: [
                Query.equal("teamId", value: teamId),
                Query.orderDesc("$createdAt")
            ]
        )
        return result.rows
    }
    
    func update(rowId: String, data: [String: Any]) async throws -> Row<[String: AnyCodable]> {
        // Remove immutable columns
        var safeData = data
        safeData.removeValue(forKey: "$id")
        safeData.removeValue(forKey: "$createdAt")
        safeData.removeValue(forKey: "$updatedAt")
        safeData.removeValue(forKey: "createdBy")
        safeData.removeValue(forKey: "teamId")
        
        return try await tablesDB.updateRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: rowId,
            data: safeData
        )
    }
    
    func delete(rowId: String) async throws {
        _ = try await tablesDB.deleteRow(
            databaseId: databaseId,
            tableId: tableId,
            rowId: rowId
        )
    }
}

// Exported tables
struct DB {
    static let items = Table("items")
    static let projects = Table("projects")
}
\`\`\`

### Vapor Controller Example

\`\`\`swift
// Controllers/ItemController.swift
import Vapor

struct ItemController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let items = routes.grouped("api", "items")
        
        let protected = items.grouped(AuthMiddleware())
        protected.get(use: index)
        protected.post(use: create)
        protected.delete(":id", use: delete)
    }
    
    func index(req: Request) async throws -> Response {
        let user = try req.auth.require(User.self)
        let items = try await DB.items.listByOwner(userId: user.id)
        
        return try Response(
            status: .ok,
            body: .init(data: JSONEncoder().encode(["items": items.map { $0.data }]))
        )
    }
    
    func create(req: Request) async throws -> Response {
        let user = try req.auth.require(User.self)
        let input = try req.content.decode(CreateItemRequest.self)
        
        let item = try await DB.items.create(data: [
            "title": input.title.trimmingCharacters(in: .whitespaces),
            "description": nil as Any,
            "createdBy": user.id,
            "teamId": input.teamId as Any
        ])
        
        return try Response(
            status: .created,
            body: .init(data: JSONEncoder().encode(["item": item.data]))
        )
    }
    
    func delete(req: Request) async throws -> Response {
        let user = try req.auth.require(User.self)
        let id = req.parameters.get("id")!
        
        guard let item = try await DB.items.get(rowId: id),
              item.data["createdBy"]?.value as? String == user.id else {
            throw Abort(.forbidden)
        }
        
        try await DB.items.delete(rowId: id)
        return Response(status: .ok)
    }
}

struct CreateItemRequest: Content {
    let title: String
    let teamId: String?
}
\`\`\`
`;

// ============================================================
// MOBILE/CLIENT SDK PATTERNS
// ============================================================

/**
 * Android SDK implementation pattern
 */
export const androidPattern = `
## Android Implementation Pattern

### Project Structure

\`\`\`
app/
├── src/main/java/com/example/app/
│   ├── AppwriteService.kt          # Client singleton
│   ├── data/
│   │   ├── repository/
│   │   │   ├── ItemRepository.kt   # Data repository
│   │   │   └── AuthRepository.kt
│   │   └── model/
│   │       └── Item.kt
│   ├── ui/
│   │   └── items/
│   │       ├── ItemsViewModel.kt
│   │       └── ItemsScreen.kt
│   └── di/
│       └── AppModule.kt            # Dependency injection
├── build.gradle.kts
└── local.properties
\`\`\`

### Appwrite Client

\`\`\`kotlin
// AppwriteService.kt
package com.example.app

import android.content.Context
import io.appwrite.Client
import io.appwrite.services.Account
import io.appwrite.services.TablesDB
import io.appwrite.services.Storage
import io.appwrite.services.Realtime

object AppwriteService {
    private lateinit var client: Client
    
    lateinit var account: Account
    lateinit var tablesDB: TablesDB
    lateinit var storage: Storage
    lateinit var realtime: Realtime
    
    const val DATABASE_ID = "your-database-id"
    const val BUCKET_ID = "your-bucket-id"
    
    fun init(context: Context) {
        client = Client(context)
            .setEndpoint(BuildConfig.APPWRITE_ENDPOINT)
            .setProject(BuildConfig.APPWRITE_PROJECT_ID)
        
        account = Account(client)
        tablesDB = TablesDB(client)
        storage = Storage(client)
        realtime = Realtime(client)
    }
}
\`\`\`

### Repository Pattern

\`\`\`kotlin
// data/repository/ItemRepository.kt
package com.example.app.data.repository

import io.appwrite.ID
import io.appwrite.Query
import io.appwrite.models.Row
import com.example.app.AppwriteService
import com.example.app.data.model.Item
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class ItemRepository {
    private val tablesDB = AppwriteService.tablesDB
    private val tableId = "items"
    
    suspend fun create(title: String, userId: String, teamId: String? = null): Item {
        val doc = tablesDB.createRow(
            databaseId = AppwriteService.DATABASE_ID,
            tableId = tableId,
            rowId = ID.unique(),
            data = mapOf(
                "title" to title.trim(),
                "description" to null,
                "createdBy" to userId,
                "teamId" to teamId
            )
        )
        return doc.toItem()
    }
    
    suspend fun listByOwner(userId: String): List<Item> {
        val result = tablesDB.listRows(
            databaseId = AppwriteService.DATABASE_ID,
            tableId = tableId,
            queries = listOf(
                Query.equal("createdBy", listOf(userId)),
                Query.orderDesc("\$createdAt"),
                Query.limit(100)
            )
        )
        return result.rows.map { it.toItem() }
    }
    
    suspend fun get(id: String): Item? {
        return try {
            tablesDB.getRow(
                databaseId = AppwriteService.DATABASE_ID,
                tableId = tableId,
                rowId = id
            ).toItem()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun update(id: String, title: String): Item {
        val doc = tablesDB.updateRow(
            databaseId = AppwriteService.DATABASE_ID,
            tableId = tableId,
            rowId = id,
            data = mapOf("title" to title.trim())
        )
        return doc.toItem()
    }
    
    suspend fun delete(id: String) {
        tablesDB.deleteRow(
            databaseId = AppwriteService.DATABASE_ID,
            tableId = tableId,
            rowId = id
        )
    }
    
    private fun Row<Map<String, Any>>.toItem(): Item {
        return Item(
            id = this.id,
            title = this.data["title"] as String,
            description = this.data["description"] as? String,
            createdBy = this.data["createdBy"] as String,
            teamId = this.data["teamId"] as? String,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}
\`\`\`

### ViewModel Pattern

\`\`\`kotlin
// ui/items/ItemsViewModel.kt
package com.example.app.ui.items

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.app.data.repository.ItemRepository
import com.example.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ItemsViewModel(
    private val itemRepository: ItemRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: StateFlow<List<Item>> = _items
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading
    
    fun loadItems() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val user = authRepository.getCurrentUser()
                _items.value = itemRepository.listByOwner(user.id)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun createItem(title: String, teamId: String? = null) {
        viewModelScope.launch {
            try {
                val user = authRepository.getCurrentUser()
                itemRepository.create(title, user.id, teamId)
                loadItems() // Refresh list
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun deleteItem(id: String) {
        viewModelScope.launch {
            try {
                itemRepository.delete(id)
                loadItems()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
\`\`\`

### Realtime Subscription

\`\`\`kotlin
// Subscribe to table changes
fun subscribeToItems(onUpdate: (List<Item>) -> Unit): RealtimeSubscription {
    return AppwriteService.realtime.subscribe(
        "databases.\${AppwriteService.DATABASE_ID}.tables.items.rows"
    ) { response ->
        // Refresh items on any change
        viewModelScope.launch {
            loadItems()
        }
    }
}

// Remember to unsubscribe in onCleared()
override fun onCleared() {
    super.onCleared()
    subscription?.close()
}
\`\`\`

### Best Practices

- Initialize AppwriteService in Application class
- Use Repository pattern for data access
- Use ViewModel for UI state management
- Handle offline/network errors gracefully
- Store session in encrypted SharedPreferences
- Never hardcode API keys in source code
`;

/**
 * Apple (iOS/macOS) SDK implementation pattern
 */
export const applePattern = `
## Apple (iOS/macOS) Implementation Pattern

### Project Structure

\`\`\`
App/
├── AppwriteService.swift       # Client singleton
├── Repositories/
│   ├── ItemRepository.swift
│   └── AuthRepository.swift
├── Models/
│   └── Item.swift
├── ViewModels/
│   └── ItemsViewModel.swift
├── Views/
│   └── ItemsView.swift
└── App.swift
\`\`\`

### Appwrite Client

\`\`\`swift
// AppwriteService.swift
import Appwrite
import Foundation

class AppwriteService {
    static let shared = AppwriteService()
    
    let client: Client
    let account: Account
    let tablesDB: TablesDB
    let storage: Storage
    let realtime: Realtime
    
    static let databaseId = "your-database-id"
    static let bucketId = "your-bucket-id"
    
    private init() {
        client = Client()
            .setEndpoint(Bundle.main.infoDictionary?["APPWRITE_ENDPOINT"] as? String ?? "")
            .setProject(Bundle.main.infoDictionary?["APPWRITE_PROJECT_ID"] as? String ?? "")
        
        account = Account(client)
        tablesDB = TablesDB(client)
        storage = Storage(client)
        realtime = Realtime(client)
    }
}
\`\`\`

### Model

\`\`\`swift
// Models/Item.swift
import Foundation

struct Item: Identifiable, Codable {
    let id: String
    var title: String
    var description: String?
    let createdBy: String
    let teamId: String?
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "$id"
        case title, description, createdBy, teamId
        case createdAt = "$createdAt"
        case updatedAt = "$updatedAt"
    }
}
\`\`\`

### Repository Pattern

\`\`\`swift
// Repositories/ItemRepository.swift
import Appwrite
import Foundation

class ItemRepository {
    private let tablesDB = AppwriteService.shared.tablesDB
    private let tableId = "items"
    
    func create(title: String, userId: String, teamId: String? = nil) async throws -> Item {
        let doc = try await tablesDB.createRow(
            databaseId: AppwriteService.databaseId,
            tableId: tableId,
            rowId: ID.unique(),
            data: [
                "title": title.trimmingCharacters(in: .whitespaces),
                "description": nil as Any,
                "createdBy": userId,
                "teamId": teamId as Any
            ]
        )
        return try JSONDecoder().decode(Item.self, from: JSONSerialization.data(withJSONObject: doc.data))
    }
    
    func listByOwner(userId: String) async throws -> [Item] {
        let result = try await tablesDB.listRows(
            databaseId: AppwriteService.databaseId,
            tableId: tableId,
            queries: [
                Query.equal("createdBy", value: userId),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        )
        
        return try result.rows.map { doc in
            try JSONDecoder().decode(Item.self, from: JSONSerialization.data(withJSONObject: doc.data))
        }
    }
    
    func get(id: String) async throws -> Item? {
        do {
            let doc = try await tablesDB.getRow(
                databaseId: AppwriteService.databaseId,
                tableId: tableId,
                rowId: id
            )
            return try JSONDecoder().decode(Item.self, from: JSONSerialization.data(withJSONObject: doc.data))
        } catch {
            return nil
        }
    }
    
    func update(id: String, title: String) async throws -> Item {
        let doc = try await tablesDB.updateRow(
            databaseId: AppwriteService.databaseId,
            tableId: tableId,
            rowId: id,
            data: ["title": title.trimmingCharacters(in: .whitespaces)]
        )
        return try JSONDecoder().decode(Item.self, from: JSONSerialization.data(withJSONObject: doc.data))
    }
    
    func delete(id: String) async throws {
        _ = try await tablesDB.deleteRow(
            databaseId: AppwriteService.databaseId,
            tableId: tableId,
            rowId: id
        )
    }
}
\`\`\`

### ViewModel (ObservableObject)

\`\`\`swift
// ViewModels/ItemsViewModel.swift
import SwiftUI

@MainActor
class ItemsViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private let itemRepository = ItemRepository()
    private let authRepository = AuthRepository()
    private var realtimeSubscription: RealtimeSubscription?
    
    func loadItems() async {
        isLoading = true
        error = nil
        
        do {
            let user = try await authRepository.getCurrentUser()
            items = try await itemRepository.listByOwner(userId: user.id)
        } catch {
            self.error = error
        }
        
        isLoading = false
    }
    
    func createItem(title: String, teamId: String? = nil) async {
        do {
            let user = try await authRepository.getCurrentUser()
            _ = try await itemRepository.create(title: title, userId: user.id, teamId: teamId)
            await loadItems()
        } catch {
            self.error = error
        }
    }
    
    func deleteItem(id: String) async {
        do {
            try await itemRepository.delete(id: id)
            await loadItems()
        } catch {
            self.error = error
        }
    }
    
    func subscribeToChanges() {
        realtimeSubscription = AppwriteService.shared.realtime.subscribe(
            channels: ["databases.\\(AppwriteService.databaseId).tables.items.rows"]
        ) { [weak self] event in
            Task { @MainActor in
                await self?.loadItems()
            }
        }
    }
    
    func unsubscribe() {
        realtimeSubscription?.close()
    }
}
\`\`\`

### SwiftUI View

\`\`\`swift
// Views/ItemsView.swift
import SwiftUI

struct ItemsView: View {
    @StateObject private var viewModel = ItemsViewModel()
    @State private var newItemTitle = ""
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.items) { item in
                    Text(item.title)
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        Task {
                            await viewModel.deleteItem(id: viewModel.items[index].id)
                        }
                    }
                }
            }
            .navigationTitle("Items")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Add") {
                        Task {
                            await viewModel.createItem(title: newItemTitle)
                        }
                    }
                }
            }
            .refreshable {
                await viewModel.loadItems()
            }
        }
        .task {
            await viewModel.loadItems()
            viewModel.subscribeToChanges()
        }
        .onDisappear {
            viewModel.unsubscribe()
        }
    }
}
\`\`\`

### Best Practices

- Use @MainActor for UI-related async operations
- Store configuration in Info.plist or xcconfig files
- Use Keychain for storing session tokens
- Handle network errors with retry logic
- Unsubscribe from realtime when view disappears
`;

/**
 * Flutter SDK implementation pattern
 */
export const flutterPattern = `
## Flutter Implementation Pattern

### Project Structure

\`\`\`
lib/
├── main.dart
├── services/
│   └── appwrite_service.dart
├── repositories/
│   ├── item_repository.dart
│   └── auth_repository.dart
├── models/
│   └── item.dart
├── providers/
│   └── items_provider.dart
└── screens/
    └── items_screen.dart
\`\`\`

### Appwrite Service

\`\`\`dart
// services/appwrite_service.dart
import 'package:appwrite/appwrite.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppwriteService {
  static final AppwriteService _instance = AppwriteService._internal();
  factory AppwriteService() => _instance;
  
  late final Client client;
  late final Account account;
  late final TablesDB tablesDB;
  late final Storage storage;
  late final Realtime realtime;
  
  static String get databaseId => dotenv.env['APPWRITE_DATABASE_ID']!;
  static String get bucketId => dotenv.env['APPWRITE_BUCKET_ID'] ?? '';
  
  AppwriteService._internal() {
    client = Client()
      .setEndpoint(dotenv.env['APPWRITE_ENDPOINT']!)
      .setProject(dotenv.env['APPWRITE_PROJECT_ID']!);
    
    account = Account(client);
    tablesDB = TablesDB(client);
    storage = Storage(client);
    realtime = Realtime(client);
  }
}
\`\`\`

### Model

\`\`\`dart
// models/item.dart
class Item {
  final String id;
  String title;
  String? description;
  final String createdBy;
  final String? teamId;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  Item({
    required this.id,
    required this.title,
    this.description,
    required this.createdBy,
    this.teamId,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Item.fromRow(Row doc) {
    return Item(
      id: doc.$id,
      title: doc.data['title'],
      description: doc.data['description'],
      createdBy: doc.data['createdBy'],
      teamId: doc.data['teamId'],
      createdAt: DateTime.parse(doc.$createdAt),
      updatedAt: DateTime.parse(doc.$updatedAt),
    );
  }
}
\`\`\`

### Repository

\`\`\`dart
// repositories/item_repository.dart
import 'package:appwrite/appwrite.dart';
import '../services/appwrite_service.dart';
import '../models/item.dart';

class ItemRepository {
  final _tablesDB = AppwriteService().tablesDB;
  final _tableId = 'items';
  
  Future<Item> create({
    required String title,
    required String userId,
    String? teamId,
  }) async {
    final doc = await _tablesDB.createRow(
      databaseId: AppwriteService.databaseId,
      tableId: _tableId,
      rowId: ID.unique(),
      data: {
        'title': title.trim(),
        'description': null,
        'createdBy': userId,
        'teamId': teamId,
      },
    );
    return Item.fromRow(doc);
  }
  
  Future<List<Item>> listByOwner(String userId) async {
    final result = await _tablesDB.listRows(
      databaseId: AppwriteService.databaseId,
      tableId: _tableId,
      queries: [
        Query.equal('createdBy', userId),
        Query.orderDesc(r'$createdAt'),
        Query.limit(100),
      ],
    );
    return result.rows.map(Item.fromRow).toList();
  }
  
  Future<Item?> get(String id) async {
    try {
      final doc = await _tablesDB.getRow(
        databaseId: AppwriteService.databaseId,
        tableId: _tableId,
        rowId: id,
      );
      return Item.fromRow(doc);
    } on AppwriteException {
      return null;
    }
  }
  
  Future<Item> update(String id, {required String title}) async {
    final doc = await _tablesDB.updateRow(
      databaseId: AppwriteService.databaseId,
      tableId: _tableId,
      rowId: id,
      data: {'title': title.trim()},
    );
    return Item.fromRow(doc);
  }
  
  Future<void> delete(String id) async {
    await _tablesDB.deleteRow(
      databaseId: AppwriteService.databaseId,
      tableId: _tableId,
      rowId: id,
    );
  }
}
\`\`\`

### Provider (Riverpod Example)

\`\`\`dart
// providers/items_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/item_repository.dart';
import '../repositories/auth_repository.dart';
import '../models/item.dart';

final itemRepositoryProvider = Provider((ref) => ItemRepository());
final authRepositoryProvider = Provider((ref) => AuthRepository());

final itemsProvider = StateNotifierProvider<ItemsNotifier, AsyncValue<List<Item>>>((ref) {
  return ItemsNotifier(
    ref.watch(itemRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class ItemsNotifier extends StateNotifier<AsyncValue<List<Item>>> {
  final ItemRepository _itemRepo;
  final AuthRepository _authRepo;
  RealtimeSubscription? _subscription;
  
  ItemsNotifier(this._itemRepo, this._authRepo) : super(const AsyncValue.loading());
  
  Future<void> loadItems() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authRepo.getCurrentUser();
      final items = await _itemRepo.listByOwner(user.$id);
      state = AsyncValue.data(items);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> createItem(String title, {String? teamId}) async {
    try {
      final user = await _authRepo.getCurrentUser();
      await _itemRepo.create(title: title, userId: user.$id, teamId: teamId);
      await loadItems();
    } catch (e) {
      // Handle error
    }
  }
  
  Future<void> deleteItem(String id) async {
    try {
      await _itemRepo.delete(id);
      await loadItems();
    } catch (e) {
      // Handle error
    }
  }
  
  void subscribeToChanges() {
    final channel = 'databases.\${AppwriteService.databaseId}.tables.items.rows';
    _subscription = AppwriteService().realtime.subscribe([channel]);
    _subscription!.stream.listen((event) => loadItems());
  }
  
  void unsubscribe() {
    _subscription?.close();
  }
  
  @override
  void dispose() {
    unsubscribe();
    super.dispose();
  }
}
\`\`\`

### Screen Widget

\`\`\`dart
// screens/items_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/items_provider.dart';

class ItemsScreen extends ConsumerStatefulWidget {
  const ItemsScreen({super.key});
  
  @override
  ConsumerState<ItemsScreen> createState() => _ItemsScreenState();
}

class _ItemsScreenState extends ConsumerState<ItemsScreen> {
  @override
  void initState() {
    super.initState();
    ref.read(itemsProvider.notifier).loadItems();
    ref.read(itemsProvider.notifier).subscribeToChanges();
  }
  
  @override
  void dispose() {
    ref.read(itemsProvider.notifier).unsubscribe();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final itemsAsync = ref.watch(itemsProvider);
    
    return Scaffold(
      appBar: AppBar(title: const Text('Items')),
      body: itemsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: \$err')),
        data: (items) => ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return ListTile(
              title: Text(item.title),
              trailing: IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () => ref.read(itemsProvider.notifier).deleteItem(item.id),
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }
  
  void _showCreateDialog(BuildContext context) {
    // Show dialog to create new item
  }
}
\`\`\`

### Best Practices

- Initialize AppwriteService before runApp()
- Use flutter_dotenv for environment variables
- Use state management (Riverpod, Provider, Bloc)
- Handle loading/error states in UI
- Dispose realtime subscriptions properly
- Use offline-first approach with local caching
`;

/**
 * React Native SDK implementation pattern
 */
export const reactNativePattern = `
## React Native Implementation Pattern

### Project Structure

\`\`\`
src/
├── services/
│   └── appwrite.ts
├── repositories/
│   ├── itemRepository.ts
│   └── authRepository.ts
├── hooks/
│   ├── useItems.ts
│   └── useAuth.ts
├── types/
│   └── index.ts
└── screens/
    └── ItemsScreen.tsx
\`\`\`

### Appwrite Service

\`\`\`typescript
// services/appwrite.ts
import { Client, Account, TablesDB, Storage } from 'react-native-appwrite'
import Config from 'react-native-config'

const client = new Client()
  .setEndpoint(Config.APPWRITE_ENDPOINT!)
  .setProject(Config.APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)
export { client }

export const DATABASE_ID = Config.APPWRITE_DATABASE_ID!
export const BUCKET_ID = Config.APPWRITE_BUCKET_ID ?? ''
\`\`\`

### Types

\`\`\`typescript
// types/index.ts
export interface Item {
  $id: string
  title: string
  description: string | null
  createdBy: string
  teamId: string | null
  $createdAt: string
  $updatedAt: string
}

export interface User {
  $id: string
  email: string
  name: string
}
\`\`\`

### Repository

\`\`\`typescript
// repositories/itemRepository.ts
import { ID, Query } from 'react-native-appwrite'
import { databases, DATABASE_ID } from '../services/appwrite'
import type { Item } from '../types'

const TABLE_ID = 'items'

export const itemRepository = {
  async create(data: { title: string; userId: string; teamId?: string }): Promise<Item> {
    return tablesDB.createRow<Item>(
      DATABASE_ID,
      TABLE_ID,
      ID.unique(),
      {
        title: data.title.trim(),
        description: null,
        createdBy: data.userId,
        teamId: data.teamId ?? null,
      }
    )
  },

  async listByOwner(userId: string): Promise<Item[]> {
    const result = await tablesDB.listRows<Item>(
      DATABASE_ID,
      TABLE_ID,
      [
        Query.equal('createdBy', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]
    )
    return result.rows
  },

  async get(id: string): Promise<Item | null> {
    try {
      return await tablesDB.getRow<Item>(DATABASE_ID, TABLE_ID, id)
    } catch {
      return null
    }
  },

  async update(id: string, data: { title?: string }): Promise<Item> {
    const updateData: Record<string, unknown> = {}
    if (data.title) updateData.title = data.title.trim()
    
    return tablesDB.updateRow<Item>(DATABASE_ID, TABLE_ID, id, updateData)
  },

  async delete(id: string): Promise<void> {
    await tablesDB.deleteRow(DATABASE_ID, TABLE_ID, id)
  },
}
\`\`\`

### Custom Hook

\`\`\`typescript
// hooks/useItems.ts
import { useState, useEffect, useCallback } from 'react'
import { RealtimeResponseEvent } from 'react-native-appwrite'
import { client, DATABASE_ID } from '../services/appwrite'
import { itemRepository } from '../repositories/itemRepository'
import { useAuth } from './useAuth'
import type { Item } from '../types'

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const loadItems = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await itemRepository.listByOwner(user.$id)
      setItems(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const createItem = useCallback(async (title: string, teamId?: string) => {
    if (!user) throw new Error('Not authenticated')
    
    await itemRepository.create({ title, userId: user.$id, teamId })
    await loadItems()
  }, [user, loadItems])

  const deleteItem = useCallback(async (id: string) => {
    await itemRepository.delete(id)
    await loadItems()
  }, [loadItems])

  // Initial load
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = \`databases.\${DATABASE_ID}.tables.items.rows\`
    const unsubscribe = client.subscribe<Item>(channel, (response: RealtimeResponseEvent<Item>) => {
      const event = response.events[0]
      
      if (event.includes('.create')) {
        setItems(prev => [response.payload, ...prev])
      } else if (event.includes('.update')) {
        setItems(prev => prev.map(item => 
          item.$id === response.payload.$id ? response.payload : item
        ))
      } else if (event.includes('.delete')) {
        setItems(prev => prev.filter(item => item.$id !== response.payload.$id))
      }
    })

    return () => unsubscribe()
  }, [user])

  return {
    items,
    isLoading,
    error,
    refresh: loadItems,
    createItem,
    deleteItem,
  }
}
\`\`\`

### Screen Component

\`\`\`typescript
// screens/ItemsScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useItems } from '../hooks/useItems'

export function ItemsScreen() {
  const { items, isLoading, error, refresh, createItem, deleteItem } = useItems()
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    await createItem(newTitle)
    setNewTitle('')
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error.message}</Text>
        <TouchableOpacity onPress={refresh}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="New item title"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <TouchableOpacity onPress={() => deleteItem(item.$id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No items yet</Text> : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  addButton: { marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 8, padding: 12 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemTitle: { fontSize: 16 },
  deleteText: { color: 'red' },
  empty: { textAlign: 'center', marginTop: 32, color: '#999' },
})
\`\`\`

### Best Practices

- Use react-native-config for environment variables
- Store session in SecureStore or encrypted storage
- Handle app state changes (background/foreground)
- Implement proper error boundaries
- Use custom hooks for data fetching logic
- Unsubscribe from realtime in cleanup functions
- Handle offline state gracefully
`;

/**
 * Get implementation pattern for a specific framework
 * @param {string} framework - Framework name
 * @returns {string} Implementation pattern
 */
export function getImplementationPattern(framework) {
  /** @type {Record<string, string>} */
  const patterns = {
    // JS SSR frameworks
    tanstack: tanstackStartPattern,
    nextjs: nextjsPattern,
    svelte: sveltekitPattern,
    nuxt: nuxtPattern,
    astro: astroPattern,
    // Server SDKs
    python: pythonServerPattern,
    php: phpServerPattern,
    go: goServerPattern,
    ruby: rubyServerPattern,
    dotnet: dotnetServerPattern,
    dart: dartServerPattern,
    kotlin: kotlinServerPattern,
    swift: swiftServerPattern,
    // Mobile/Client SDKs
    android: androidPattern,
    apple: applePattern,
    flutter: flutterPattern,
    'react-native': reactNativePattern,
  };
  
  return patterns[framework] || '';
}

/**
 * Check if framework is a server SDK
 * @param {string} framework - Framework name
 * @returns {boolean}
 */
export function isServerSDK(framework) {
  const serverSDKs = ['python', 'php', 'go', 'ruby', 'dotnet', 'dart', 'kotlin', 'swift'];
  return serverSDKs.includes(framework);
}

/**
 * Check if framework is a mobile/client SDK
 * @param {string} framework - Framework name
 * @returns {boolean}
 */
export function isMobileSDK(framework) {
  const mobileSDKs = ['android', 'apple', 'flutter', 'react-native'];
  return mobileSDKs.includes(framework);
}

/**
 * Get full implementation guide for a JS SSR framework
 * @param {string} framework - Framework name
 * @param {string} [sdk='javascript'] - SDK name for template selection
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {string} Complete implementation guide
 */
export function getFullImplementationGuide(framework, sdk = 'javascript', features = []) {
  const frameworkPattern = getImplementationPattern(framework);
  
  if (!frameworkPattern) {
    return generalImplementationRules;
  }
  
  // Build sections based on selected features
  const sections = [generalImplementationRules, frameworkPattern];
  
  // Include database-specific rules if database is selected
  if (features.includes('database')) {
    sections.push(databaseImplementationRules);
    sections.push(getDatabaseWrapperTemplate(sdk));
  }
  
  // Include storage-specific rules if storage is selected
  if (features.includes('storage')) {
    sections.push(storageImplementationRules);
    sections.push(getStorageWrapperTemplate(sdk));
  }
  
  // Include other service patterns
  if (features.includes('functions')) {
    sections.push(functionsPattern);
  }
  
  if (features.includes('messaging')) {
    sections.push(messagingPattern);
  }
  
  if (features.includes('realtime')) {
    sections.push(realtimePattern);
  }
  
  if (features.includes('sites')) {
    sections.push(sitesPattern);
  }
  
  return sections.join('\n\n');
}

/**
 * Get implementation guide for server SDKs
 * @param {string} sdk - SDK/Framework name (python, php, go, ruby, dotnet, dart, kotlin, swift)
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {string} Server SDK implementation guide
 */
export function getServerImplementationGuide(sdk, features = []) {
  const frameworkPattern = getImplementationPattern(sdk);
  
  if (!frameworkPattern) {
    return '';
  }
  
  // Build sections based on selected features
  const sections = [generalImplementationRules, frameworkPattern];
  
  // Include database-specific rules if database is selected
  if (features.includes('database')) {
    sections.push(databaseImplementationRules);
    sections.push(getDatabaseWrapperTemplate(sdk));
  }
  
  // Include storage-specific rules if storage is selected
  if (features.includes('storage')) {
    sections.push(storageImplementationRules);
    sections.push(getStorageWrapperTemplate(sdk));
  }
  
  // Include other service patterns
  if (features.includes('functions')) {
    sections.push(functionsPattern);
  }
  
  if (features.includes('messaging')) {
    sections.push(messagingPattern);
  }
  
  return sections.join('\n\n');
}

/**
 * Get implementation guide for mobile/client SDKs
 * @param {string} sdk - SDK/Framework name (android, apple, flutter, react-native)
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {string} Mobile SDK implementation guide
 */
export function getMobileImplementationGuide(sdk, features = []) {
  const frameworkPattern = getImplementationPattern(sdk);
  
  if (!frameworkPattern) {
    return '';
  }
  
  // Build sections based on selected features
  const sections = [generalImplementationRules, frameworkPattern];
  
  // Include database-specific rules if database is selected
  if (features.includes('database')) {
    sections.push(databaseImplementationRules);
    sections.push(getDatabaseWrapperTemplate(sdk));
  }
  
  // Include storage-specific rules if storage is selected
  if (features.includes('storage')) {
    sections.push(storageImplementationRules);
    sections.push(getStorageWrapperTemplate(sdk));
  }
  
  // Include other service patterns
  if (features.includes('functions')) {
    sections.push(functionsPattern);
  }
  
  if (features.includes('messaging')) {
    sections.push(messagingPattern);
  }
  
  if (features.includes('realtime')) {
    sections.push(realtimePattern);
  }
  
  return sections.join('\n\n');
}
