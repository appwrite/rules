import { nodeAppwriteInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { ssrAuthPattern } from '../common/security.js';

export const nuxt = createFrameworkTemplate({
	installation: nodeAppwriteInstall,
	securityNotes: `**Best Practices:**
- Store endpoint and project ID in \`nuxt.config.ts\`
- Never commit API keys to version control
- Use Nuxt server routes for SSR authentication
- API keys should NEVER be exposed to client-side code

**Rendering Strategy:**
- Default to server-side rendering (SSR) for all pages
- Only use client-side rendering when explicitly needed
- Leverage server API routes and middleware for data operations`,
	additionalNotes: ssrAuthPattern
});

