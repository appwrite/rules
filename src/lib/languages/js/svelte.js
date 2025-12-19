import { nodeAppwriteInstall } from '../common/install.js';
import { ssrAuthPattern } from '../common/security.js';
import { getFullImplementationGuide } from '../common/implementation-patterns.js';

export async function svelte(features = []) {
	const sveltekitImplementation = getFullImplementationGuide('svelte', 'javascript', features);

	return `${nodeAppwriteInstall}

**Framework Documentation:**
- [SvelteKit Load Functions](https://kit.svelte.dev/docs/load)
- [SvelteKit Form Actions](https://kit.svelte.dev/docs/form-actions)
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/sveltekit)

${ssrAuthPattern}

${sveltekitImplementation}

## SvelteKit-Specific Best Practices

### File Organization
\`\`\`
src/
├── lib/
│   └── server/
│       ├── db.ts         # Database wrapper (server-only)
│       ├── storage.ts    # Storage wrapper (server-only)
│       └── auth.ts       # Auth helpers
├── routes/
│   ├── items/
│   │   ├── +page.svelte      # Client component
│   │   ├── +page.server.ts   # Load + Actions
│   │   └── +server.ts        # API endpoints
│   └── +layout.server.ts     # Root auth check
└── hooks.server.ts           # Auth middleware
\`\`\`

### Auth Hook Pattern
\`\`\`typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { getSession } from '$lib/server/auth'

export const handle: Handle = async ({ event, resolve }) => {
  const session = await getSession(event.cookies)
  event.locals.user = session?.user ?? null
  return resolve(event)
}
\`\`\`

### Form Actions Pattern
\`\`\`svelte
<!-- +page.svelte -->
<script>
  import { enhance } from '$app/forms'
</script>

<form method="POST" action="?/create" use:enhance>
  <input name="title" required />
  <button type="submit">Create</button>
</form>
\`\`\`

### Progressive Enhancement
- Use \`use:enhance\` for form submissions to enable JS-enhanced UX
- Forms work without JavaScript enabled
- Server handles all validation and ownership checks
`;
}

