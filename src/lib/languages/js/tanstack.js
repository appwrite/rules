import { nodeAppwriteInstall } from '../common/install.js';
import { ssrAuthPattern } from '../common/security.js';
import { getFullImplementationGuide } from '../common/implementation-patterns.js';

export async function tanstack(features = []) {
	const tanstackImplementation = getFullImplementationGuide('tanstack', 'javascript', features);

	return `${nodeAppwriteInstall}

**Framework Documentation:**
- [TanStack Start Docs](https://tanstack.com/start/latest)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/tanstack)

${ssrAuthPattern}

${tanstackImplementation}

## TanStack-Specific Best Practices

- Use \`createServerFn\` for ALL data operations - never call SDK from components
- Validate inputs in server functions before processing
- Use \`router.invalidate()\` after mutations to refresh cached data
- Leverage TanStack Query for client-side caching when needed
- Keep server functions in dedicated files (e.g., \`server/functions/\`)
- Export typed return types from server functions

## Query Invalidation Pattern

\`\`\`typescript
// After mutation, invalidate relevant queries
const router = useRouter()

async function handleCreate(data) {
  await createItemFn({ data })
  router.invalidate() // Invalidates all route data
}

// Or use TanStack Query for fine-grained control
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['items'] })
\`\`\`
`;
}

