import { rubyInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurityWithConfig } from '../common/security.js';

export const server = createFrameworkTemplate({
	installation: rubyInstall,
	securityNotes: serverSecurityWithConfig('environment variables or Rails credentials')
});

