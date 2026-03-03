import { getSDKVersion } from '../../utils/versions.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Generates the Swift SDK installation template with the latest version
 * @param {string} version - The SDK version to use
 * @returns {string}
 */
function generateInstallationTemplate(version) {
	return `## SDK Installation

Add the Appwrite Swift Server SDK to your \`Package.swift\`:

\`\`\`swift
dependencies: [
    .package(url: "https://github.com/appwrite/sdk-for-swift", from: "${version}")
]
\`\`\`

Or add it via Xcode:
1. File → Add Packages...
2. Enter: \`https://github.com/appwrite/sdk-for-swift\`
3. Select version: \`${version}\` or later`;
}

/**
 * Gets the Swift SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const vanilla = async (features = []) => {
	const version = await getSDKVersion('server-swift');
	const installation = generateInstallationTemplate(version);
	const swiftImplementation = getServerImplementationGuide('swift', features);

	return `${installation}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/swift)

${serverSecurity}

${swiftImplementation}

## Swift Server Best Practices

- Use Vapor or Hummingbird for HTTP servers
- Use async/await for all SDK operations
- Use Codable for JSON serialization
- Use actors for thread-safe singletons
- Handle errors with do/catch
- Use Swift Package Manager for dependencies
- Store configuration in environment variables
`;
};
