import { getSDKVersion } from '../../utils/versions.js';
import { clientSecurity } from '../common/security.js';
import { getMobileImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Generates the Android SDK installation template with the latest version
 * @param {string} version - The SDK version to use
 * @returns {string}
 */
function generateInstallationTemplate(version) {
	return `## SDK Installation

Add the Appwrite Android SDK to your \`build.gradle.kts\`:

**Recommended: Specify exact version for stability**

\`\`\`kotlin
dependencies {
    implementation("io.appwrite:sdk-for-android:${version}")
}
\`\`\`

Or for Maven, add to \`pom.xml\`:

**Recommended: Specify exact version**

\`\`\`xml
<dependency>
    <groupId>io.appwrite</groupId>
    <artifactId>sdk-for-android</artifactId>
    <version>${version}</version>
</dependency>
\`\`\`
`;
}

/**
 * Gets the Android SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const vanilla = async (features = []) => {
	const version = await getSDKVersion('client-android');
	const installation = generateInstallationTemplate(version);
	const androidImplementation = getMobileImplementationGuide('android', features);

	return `${installation}

**Framework Documentation:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/android)

${clientSecurity}

${androidImplementation}

## Android-Specific Best Practices

- Initialize AppwriteService in Application class
- Use Hilt or Koin for dependency injection
- Use ViewModel + StateFlow for UI state
- Store session in EncryptedSharedPreferences
- Handle configuration changes properly
- Use WorkManager for background operations
- Follow Material Design guidelines
`;
};
