import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurity } from '../common/security.js';

export const vanilla = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: clientSecurity
		.replace('- Initialize services once and export as singletons', '')
		.trim()
});
