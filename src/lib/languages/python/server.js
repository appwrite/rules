import { pythonInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity } from '../common/security.js';

export const server = createFrameworkTemplate({
	installation: pythonInstall,
	securityNotes: serverSecurity
});

