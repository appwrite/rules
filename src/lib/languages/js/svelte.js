import { nodeAppwriteInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { ssrAuthPattern } from '../common/security.js';

export const svelte = createFrameworkTemplate({
	installation: nodeAppwriteInstall,
	securityNotes: `**Best Practices:**
- Store endpoint and project ID in \`.env\` file
- Never commit API keys to version control
- Use SvelteKit server routes (+server.js) for SSR authentication
- API keys should NEVER be exposed to client-side code
- Use node-appwrite for server-side operations

**Rendering Strategy:**
- Default to server-side rendering (SSR) for all pages
- Only use client-side rendering when explicitly needed
- Leverage server load functions and form actions for data operations`,
	additionalNotes: ssrAuthPattern
});

