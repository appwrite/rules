import { dotnetInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';

export const vanilla = createFrameworkTemplate({
	installation: dotnetInstall,
	securityNotes: ''
});

