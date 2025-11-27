import { jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity } from '../common/security.js';

export const nodejs = createFrameworkTemplate({
	installation: jsInstall('node-appwrite', 'Install the Appwrite Node.js SDK'),
	securityNotes: `${serverSecurity}
- Never log or expose API keys in error messages`
});

