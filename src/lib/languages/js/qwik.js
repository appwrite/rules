import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { clientSecurity, authNote } from '../common/security.js';

export const qwik = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: clientSecurity,
	additionalNotes: authNote
});

