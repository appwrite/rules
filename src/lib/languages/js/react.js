import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurity } from '../common/security.js';

export const react = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: clientSecurity
});
