import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurityWithEnv, authNote } from '../common/security.js';

export const qwik = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: `${clientSecurityWithEnv('.env')}

**Server-Side Security (Critical for Qwik):**
- API keys should NEVER be exposed to client-side code
- Separate client and server code: protect API keys on server, never expose them to client
- Use route loaders (\`routeLoader$\`) or server endpoints (\`server$\`) for secret operations
- For operations requiring API keys, use server actions or route loaders that run only on the server
- Client-side code should only use public endpoint and project ID`,
	additionalNotes: authNote
});

