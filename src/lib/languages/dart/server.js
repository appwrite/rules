import { getSDKVersion } from '$lib/utils/versions.js';
import { dartInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity } from '../common/security.js';

/**
 * Gets the Dart Server SDK installation template with the latest version from Appwrite's API
 * @returns {Promise<string>}
 */
export const server = async () => {
	const version = await getSDKVersion('server-dart');
	const installation = dartInstall(version, true);
	return createFrameworkTemplate({ installation, securityNotes: serverSecurity });
};

