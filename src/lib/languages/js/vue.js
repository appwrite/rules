import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurityWithEnv } from '../common/security.js';

export const vue = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: clientSecurityWithEnv('.env')
});
