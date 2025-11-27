import { getSDKVersion } from '$lib/utils/versions.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { serverSecurity } from '../common/security.js';

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
 * @returns {Promise<string>}
 */
export const vanilla = async () => {
	const version = await getSDKVersion('server-kotlin');
	const installation = generateInstallationTemplate(version);
	return createFrameworkTemplate({ installation, securityNotes: serverSecurity });
};
