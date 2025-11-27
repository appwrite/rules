import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { authNote } from '../common/security.js';

export const nuxt = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: `**Best Practices:**
- Store endpoint and project ID in \`nuxt.config.ts\`
- Never commit API keys to version control
- Use Nuxt plugins for client-side initialization`,
	additionalNotes: authNote
});

