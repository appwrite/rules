import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurityWithEnv, authNote } from '../common/security.js';

export const astro = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: `${clientSecurityWithEnv('.env')}

- Use separate clients for client-side and server-side operations`,
	additionalNotes: authNote
});

