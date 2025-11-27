import { getSDKVersion } from '$lib/utils/versions.js';
import { dartInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';

/**
 * Gets the Flutter SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator for Flutter
 * @returns {Promise<string>}
 */
export const flutter = async () => {
	const version = await getSDKVersion('client-flutter');
	const installation = dartInstall(version, false);
	return createFrameworkTemplate({ installation, securityNotes: '' });
};

/**
 * Export vanilla as an alias to flutter for backwards compatibility
 * @returns {Promise<string>}
 */
export const vanilla = flutter;

/**
 * Export server from server.js
 */
export { server } from './server.js';

