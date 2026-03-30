import { jsInstall } from '../common/install.js';
import { getMobileImplementationGuide } from '../common/implementation-patterns.js';

export async function vanilla(features = []) {
	const reactNativeImplementation = getMobileImplementationGuide('react-native', features);

	return `${jsInstall('react-native-appwrite', 'Install the Appwrite React Native SDK')}

**Framework Documentation:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/react-native)

**Best Practices:**
- Store endpoint and project ID in react-native-config
- Never commit API keys to version control
- Initialize services once and export as singletons

${reactNativeImplementation}

## React Native-Specific Best Practices

- Use react-native-config for environment variables
- Store session in expo-secure-store or react-native-keychain
- Use React Navigation for routing
- Handle app state changes (AppState API)
- Implement proper error boundaries
- Use custom hooks for data fetching logic
- Test on both iOS and Android
`;
}
