import { getSDKVersion } from '../../utils/versions.js';
import { clientSecurity } from '../common/security.js';
import { getMobileImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Generates the Apple SDK installation template with the latest version
 * @param {string} version - The SDK version to use
 * @returns {string}
 */
function generateInstallationTemplate(version) {
	return `## SDK Installation

Add the Appwrite Apple SDK to your \`Package.swift\`:

\`\`\`swift
dependencies: [
    .package(url: "https://github.com/appwrite/sdk-for-apple", from: "${version}")
]
\`\`\`

Or add it via Xcode:
1. File → Add Packages...
2. Enter: \`https://github.com/appwrite/sdk-for-apple\`
3. Select version: \`${version}\` or later`;
}

/**
 * Gets the Apple SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const vanilla = async (features = []) => {
	const version = await getSDKVersion('client-apple');
	const installation = generateInstallationTemplate(version);
	const appleImplementation = getMobileImplementationGuide('apple', features);
	
	return `${installation}

**Framework Documentation:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/apple)

${clientSecurity}

${appleImplementation}

## Apple Platform Best Practices

- Use @MainActor for UI-related async operations
- Store configuration in Info.plist or xcconfig files
- Use Keychain for storing session tokens
- Use Combine or async/await for reactive programming
- Follow Human Interface Guidelines
- Support Dark Mode and Dynamic Type
- Test on multiple device sizes
`;
};
