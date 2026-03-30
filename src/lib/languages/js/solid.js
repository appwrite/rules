import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurityWithEnv, authNote } from '../common/security.js';

export const solid = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: clientSecurityWithEnv('.env'),
	additionalNotes: authNote
});
