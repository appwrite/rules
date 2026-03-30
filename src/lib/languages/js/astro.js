import { nodeAppwriteInstall } from '../common/install.js';
import { ssrAuthPattern } from '../common/security.js';
import { getFullImplementationGuide } from '../common/implementation-patterns.js';

export async function astro(features = []) {
	const astroImplementation = getFullImplementationGuide('astro', 'javascript', features);
	const authSection = features.includes('auth') ? `\n${ssrAuthPattern}\n` : '';

	return `${nodeAppwriteInstall}

**Framework Documentation:**
- [Astro Server Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Astro Middleware](https://docs.astro.build/en/guides/middleware/)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/astro)

**API References:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Account API](https://appwrite.io/docs/references/cloud/server-nodejs/account) - Session management and account operations
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations and queries
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File upload, download, and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
${authSection}
${astroImplementation}

## Astro-Specific Best Practices

### File Organization
\`\`\`
src/
├── lib/
│   ├── db.ts              # Database wrapper (server-only)
│   ├── storage.ts         # Storage wrapper (server-only)
│   └── auth.ts            # Auth helpers
├── pages/
│   ├── api/
│   │   ├── items/
│   │   │   ├── index.ts   # GET/POST /api/items
│   │   │   └── [id].ts    # GET/PUT/DELETE /api/items/:id
│   │   └── auth/
│   │       └── session.ts
│   └── items.astro        # Server-rendered page
├── components/
│   └── ItemsList.tsx      # Interactive component
└── middleware.ts          # Auth middleware
\`\`\`

### Middleware Pattern
\`\`\`typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware'
import { getSession } from '@/lib/auth'

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request)
  context.locals.user = session?.user ?? null
  return next()
})
\`\`\`

### Hybrid Rendering
\`\`\`astro
---
// Force server rendering for this page
export const prerender = false

import { db } from '@/lib/db'
const user = Astro.locals.user
if (!user) return Astro.redirect('/login')

const items = await db.items.listByOwner(user.id)
---

<Layout>
  <!-- Static content rendered on server -->
  <h1>Your Items</h1>
  
  <!-- Interactive component hydrated on client -->
  <ItemsList items={items} client:load />
</Layout>
\`\`\`

### Client Directive Guidelines
- \`client:load\` - Hydrate immediately (for critical interactivity)
- \`client:idle\` - Hydrate when browser is idle
- \`client:visible\` - Hydrate when component enters viewport
- Never use Appwrite SDK in client components
`;
}
