import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity, authNote } from '../common/security.js';

export const nextjs = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: serverSecurity,
	additionalNotes: authNote
});

