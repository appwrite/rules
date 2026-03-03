import { jsInstallDefault as jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { frameworkNotes } from '../common/security.js';

export const angular = createFrameworkTemplate({
	installation: jsInstall,
	securityNotes: frameworkNotes.angular
});
