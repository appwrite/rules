import { getSDKVersion } from '../../utils/versions.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

/**
 * Generates the Kotlin SDK installation template with the latest version
 * @param {string} version - The SDK version to use
 * @returns {string}
 */
function generateInstallationTemplate(version) {
	return `## SDK Installation

Add the Appwrite Kotlin SDK to your \`build.gradle.kts\`:

**Recommended: Specify exact version for stability**

\`\`\`kotlin
dependencies {
    implementation("io.appwrite:sdk-for-kotlin:${version}")
}
\`\`\`

Or for Maven, add to \`pom.xml\`:

**Recommended: Specify exact version**

\`\`\`xml
<dependency>
    <groupId>io.appwrite</groupId>
    <artifactId>sdk-for-kotlin</artifactId>
    <version>${version}</version>
</dependency>
\`\`\`
`;
}

/**
 * Gets the Kotlin SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator
 * @param {string[]} [features=[]] - Selected features to include patterns for
 * @returns {Promise<string>}
 */
export const vanilla = async (features = []) => {
	const version = await getSDKVersion('server-kotlin');
	const installation = generateInstallationTemplate(version);
	const kotlinImplementation = getServerImplementationGuide('kotlin', features);

	return `${installation}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/kotlin)

${serverSecurity}

${kotlinImplementation}

## Kotlin-Specific Best Practices

- Use Ktor or Spring Boot for HTTP servers
- Use coroutines for async operations
- Use Kotlin Flow for reactive streams
- Use data classes for models
- Use object declarations for singletons
- Handle errors with Result or sealed classes
- Use Koin or Hilt for dependency injection
`;
};
