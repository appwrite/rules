import { getSDKVersion } from '../../utils/versions.js';
import { dartInstall } from '../common/install.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Gets the Dart Server SDK installation template with the latest version from Appwrite's API
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const server = async (features = []) => {
	const version = await getSDKVersion('server-dart');
	const installation = dartInstall(version, true);
	const dartImplementation = getServerImplementationGuide('dart', features);

	return `${installation}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/dart)

${serverSecurity}

${dartImplementation}

## Dart Server Best Practices

- Use shelf or dart_frog for HTTP servers
- Use environment variables for configuration
- Implement proper error handling with try/catch
- Use null safety features (Dart 2.12+)
- Create factory constructors for models
- Use streams for realtime data
`;
};
