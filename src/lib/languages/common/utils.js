/**
 * Utility functions for composing SDK initialization templates
 */

/**
 * Creates a security/best practices section (SDK Initialization section removed)
 * @param {Object} options
 * @param {string} options.securityNotes - Security/best practices section
 * @param {string} [options.additionalNotes] - Additional framework-specific notes
 * @returns {string}
 */
export function createSecuritySection({ securityNotes, additionalNotes = '' }) {
	return securityNotes + (additionalNotes ? `\n\n${additionalNotes}` : '');
}

/**
 * Client-side API references for JavaScript frameworks
 */
const clientAPIReferences = `
**API References:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations and queries
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File upload, download, and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
`;

/**
 * Creates a complete framework template by combining installation and security notes
 * @param {Object} options
 * @param {string} options.installation - Installation section
 * @param {string} options.securityNotes - Security/best practices section
 * @param {string} [options.additionalNotes] - Additional framework-specific notes
 * @param {boolean} [options.includeAPIReferences=true] - Whether to include API references
 * @returns {string}
 */
export function createFrameworkTemplate({
	installation,
	securityNotes,
	additionalNotes = '',
	includeAPIReferences = true
}) {
	const securitySection = createSecuritySection({ securityNotes, additionalNotes });
	const apiSection = includeAPIReferences ? clientAPIReferences : '';
	return `${installation}
${apiSection}
${securitySection}`;
}

/**
 * Quick Start Guide URLs by framework
 */
export const quickStartUrls = {
	// JavaScript frameworks
	react: 'https://appwrite.io/docs/quick-starts/react',
	nextjs: 'https://appwrite.io/docs/quick-starts/nextjs',
	vue: 'https://appwrite.io/docs/quick-starts/vue',
	svelte: 'https://appwrite.io/docs/quick-starts/sveltekit',
	angular: 'https://appwrite.io/docs/quick-starts/angular',
	astro: 'https://appwrite.io/docs/quick-starts/astro',
	nuxt: 'https://appwrite.io/docs/quick-starts/nuxt',
	qwik: 'https://appwrite.io/docs/quick-starts/qwik',
	solid: 'https://appwrite.io/docs/quick-starts/solid',
	tanstack: 'https://appwrite.io/docs/quick-starts/tanstack',
	nodejs: 'https://appwrite.io/docs/quick-starts/nodejs',
	vanilla: 'https://appwrite.io/docs/quick-starts/web',

	// Mobile Client SDKs
	apple: 'https://appwrite.io/docs/quick-starts/apple',
	android: 'https://appwrite.io/docs/quick-starts/android',
	flutter: 'https://appwrite.io/docs/quick-starts/flutter',
	'react-native': 'https://appwrite.io/docs/quick-starts/react-native',

	// Server SDKs
	python: 'https://appwrite.io/docs/quick-starts/python',
	php: 'https://appwrite.io/docs/quick-starts/php',
	go: 'https://appwrite.io/docs/quick-starts/go',
	ruby: 'https://appwrite.io/docs/quick-starts/ruby',
	dotnet: 'https://appwrite.io/docs/quick-starts/dotnet',
	dart: 'https://appwrite.io/docs/quick-starts/dart',
	kotlin: 'https://appwrite.io/docs/quick-starts/kotlin',
	swift: 'https://appwrite.io/docs/quick-starts/swift'
};

/**
 * Framework display names
 */
export const frameworkNames = {
	react: 'React',
	nextjs: 'Next.js',
	vue: 'Vue',
	svelte: 'SvelteKit',
	angular: 'Angular',
	astro: 'Astro',
	nuxt: 'Nuxt',
	qwik: 'Qwik',
	solid: 'Solid',
	tanstack: 'TanStack',
	nodejs: 'Node.js',
	vanilla: 'Web',
	apple: 'Apple',
	android: 'Android',
	flutter: 'Flutter',
	'react-native': 'React Native',
	python: 'Python',
	php: 'PHP',
	go: 'Go',
	ruby: 'Ruby',
	dotnet: '.NET',
	dart: 'Dart',
	kotlin: 'Kotlin',
	swift: 'Swift'
};
