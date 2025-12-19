import { nodeAppwriteInstall } from '../common/install.js';
import { ssrAuthPattern } from '../common/security.js';
import { getFullImplementationGuide } from '../common/implementation-patterns.js';

export async function nextjs(features = []) {
	const nextjsImplementation = getFullImplementationGuide('nextjs', 'javascript', features);

	return `${nodeAppwriteInstall}

**Framework Documentation:**
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/nextjs)

${ssrAuthPattern}

${nextjsImplementation}

## Next.js-Specific Best Practices

### Rendering Strategy
- Default to Server Components for all data fetching
- Use \`'use server'\` for all mutation functions
- Only use Client Components when explicitly needed for interactivity
- Never import Appwrite SDK in Client Components

### Data Fetching Pattern
\`\`\`typescript
// In Server Component - direct async/await
async function ItemsPage() {
  const items = await db.items.listByOwner(userId)
  return <ItemsList items={items} />
}
\`\`\`

### Revalidation
\`\`\`typescript
// After mutations, revalidate the path
import { revalidatePath } from 'next/cache'

export async function createItem(data) {
  'use server'
  const item = await db.items.create(data)
  revalidatePath('/items')
  return { item }
}
\`\`\`

### File Organization
\`\`\`
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
\`\`\`
`;
}

