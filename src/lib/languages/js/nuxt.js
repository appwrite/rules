import { nodeAppwriteInstall } from '../common/install.js';
import { ssrAuthPattern } from '../common/security.js';
import { getFullImplementationGuide } from '../common/implementation-patterns.js';

export async function nuxt(features = []) {
	const nuxtImplementation = getFullImplementationGuide('nuxt', 'javascript', features);
	const authSection = features.includes('auth') ? `\n${ssrAuthPattern}\n` : '';

	return `${nodeAppwriteInstall}

**Framework Documentation:**
- [Nuxt Server Routes](https://nuxt.com/docs/guide/directory-structure/server)
- [Nuxt Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/nuxt)

**API References:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Account API](https://appwrite.io/docs/references/cloud/server-nodejs/account) - Session management and account operations
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations and queries
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File upload, download, and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
${authSection}
${nuxtImplementation}

## Nuxt-Specific Best Practices

### Server Route Organization
\`\`\`
server/
├── api/
│   ├── items/
│   │   ├── index.get.ts    # GET /api/items
│   │   ├── index.post.ts   # POST /api/items
│   │   └── [id].delete.ts  # DELETE /api/items/:id
│   └── auth/
│       └── session.get.ts
├── lib/
│   ├── db.ts              # Database wrapper
│   └── storage.ts         # Storage wrapper
└── middleware/
    └── auth.ts            # Auth middleware
\`\`\`

### Auth Middleware Pattern
\`\`\`typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Skip auth for public routes
  if (event.path.startsWith('/api/public')) return

  const session = await getSession(event)
  event.context.user = session?.user ?? null
})
\`\`\`

### Composables for Client
\`\`\`typescript
// composables/useItems.ts
export function useItems() {
  const { data: items, refresh } = useFetch('/api/items')
  
  async function createItem(title: string) {
    await $fetch('/api/items', {
      method: 'POST',
      body: { title }
    })
    await refresh()
  }
  
  return { items, createItem, refresh }
}
\`\`\`

### Environment Configuration
\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only (never exposed to client)
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    // Can be overridden by NUXT_PUBLIC_* env vars
    public: {
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_PROJECT_ID,
    }
  }
})
\`\`\`
`;
}
