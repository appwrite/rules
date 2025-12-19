import { getSDKVersion } from '../../utils/versions.js';
import { dartInstall } from '../common/install.js';
import { getMobileImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Gets the Flutter SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator for Flutter
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const flutter = async (features = []) => {
	const version = await getSDKVersion('client-flutter');
	const installation = dartInstall(version, false);
	const flutterImplementation = getMobileImplementationGuide('flutter', features);
	
	return `${installation}

**Framework Documentation:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/flutter)

${flutterImplementation}

## Flutter-Specific Best Practices

- Initialize AppwriteService in main() before runApp()
- Use flutter_dotenv for environment variables
- Use Riverpod, Provider, or Bloc for state management
- Handle loading/error states in UI with AsyncValue
- Dispose realtime subscriptions in dispose()
- Use flutter_secure_storage for session tokens
- Implement offline-first with local caching (Hive, Isar)
`;
};

/**
 * Export vanilla as an alias to flutter for backwards compatibility
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const vanilla = flutter;

/**
 * Export server from server.js
 */
export { server } from './server.js';
