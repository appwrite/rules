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
export function createSecuritySection({
	securityNotes,
	additionalNotes = ''
}) {
	return securityNotes + (additionalNotes ? `\n\n${additionalNotes}` : '');
}

/**
 * Creates a complete framework template by combining installation and security notes
 * @param {Object} options
 * @param {string} options.installation - Installation section
 * @param {string} options.securityNotes - Security/best practices section
 * @param {string} [options.additionalNotes] - Additional framework-specific notes
 * @returns {string}
 */
export function createFrameworkTemplate({ installation, securityNotes, additionalNotes = '' }) {
	const securitySection = createSecuritySection({ securityNotes, additionalNotes });
	return `${installation}

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
	
	// React Native
	'react-native': 'https://appwrite.io/docs/quick-starts/react-native',
	
	// Server SDKs
	python: 'https://appwrite.io/docs/quick-starts/python',
	php: 'https://appwrite.io/docs/quick-starts/php',
	go: 'https://appwrite.io/docs/quick-starts/go',
	ruby: 'https://appwrite.io/docs/quick-starts/ruby',
	dotnet: 'https://appwrite.io/docs/quick-starts/dotnet',
	dart: 'https://appwrite.io/docs/quick-starts/dart',
	flutter: 'https://appwrite.io/docs/quick-starts/flutter',
	kotlin: 'https://appwrite.io/docs/quick-starts/kotlin'
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
	'react-native': 'React Native',
	python: 'Python',
	php: 'PHP',
	go: 'Go',
	ruby: 'Ruby',
	dotnet: '.NET',
	dart: 'Dart',
	flutter: 'Flutter',
	kotlin: 'Kotlin'
};

