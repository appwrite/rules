import { dotnetInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurityWithConfig } from '../common/security.js';

export const server = createFrameworkTemplate({
	installation: dotnetInstall,
	securityNotes: serverSecurityWithConfig('configuration files or environment variables')
});

