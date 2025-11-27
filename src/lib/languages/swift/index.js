import { getSDKVersion } from '$lib/utils/versions.js';
import { createFrameworkTemplate } from '../common/utils.js';

/**
 * Generates the Swift SDK installation template with the latest version
 * @param {string} version - The SDK version to use
 * @returns {string}
 */
function generateInstallationTemplate(version) {
	return `## SDK Installation

Add the Appwrite Swift SDK to your \`Package.swift\`:

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
 * Gets the Swift SDK installation template with the latest version from Appwrite's API
 * This is the main export used by the rules generator
 * @returns {Promise<string>}
 */
export const vanilla = async () => {
	const version = await getSDKVersion('client-apple');
	const installation = generateInstallationTemplate(version);
	return createFrameworkTemplate({ installation, securityNotes: '' });
};

