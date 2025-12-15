import { nodeAppwriteInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity, ssrAuthPattern } from '../common/security.js';

export const nextjs = createFrameworkTemplate({
	installation: nodeAppwriteInstall,
	securityNotes: `${serverSecurity}

**Rendering Strategy:**
- Default to Server Components and server-side pages
- Only use Client Components when explicitly needed for interactivity
- Leverage Server Actions for mutations and data fetching`,
	additionalNotes: ssrAuthPattern
});

