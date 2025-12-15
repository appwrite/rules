import { nodeAppwriteInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { ssrAuthPattern } from '../common/security.js';

export const astro = createFrameworkTemplate({
	installation: nodeAppwriteInstall,
	securityNotes: `**Best Practices:**
- Store endpoint and project ID in \`.env\` file
- Never commit API keys to version control
- Use Astro API routes for SSR authentication
- API keys should NEVER be exposed to client-side code
- Use node-appwrite for server-side operations

**Rendering Strategy:**
- Default to static/server-side rendering for all pages
- Only add client-side interactivity with client:* directives when needed
- Leverage Astro API routes for server-side operations`,
	additionalNotes: ssrAuthPattern
});

