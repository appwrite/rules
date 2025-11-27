// Rules generator for different Appwrite SDKs and frameworks
import * as codeExamples from './languages/index.js';
import { generateMCPRecommendation } from './languages/common/mcp.js';

/** @typedef {Object} SDKConfig
 * @property {string} name
 * @property {string[]} frameworks
 * @property {string} importSyntax
 * @property {string} exportSyntax
 * @property {string} asyncSyntax
 */

/** @typedef {Object} GeneratorConfig
 * @property {string} sdk
 * @property {string} framework
 * @property {string[]} features
 */

/** @type {Record<string, SDKConfig>} */
export const SDK_OPTIONS = {
	javascript: {
		name: 'JavaScript/TypeScript',
		frameworks: ['nextjs', 'react', 'vue', 'svelte', 'angular', 'astro', 'nuxt', 'qwik', 'solid', 'tanstack', 'nodejs', 'vanilla'],
		importSyntax: 'import',
		exportSyntax: 'export',
		asyncSyntax: 'async/await'
	},
	'react-native': {
		name: 'React Native',
		frameworks: ['react-native', 'vanilla'],
		importSyntax: 'import',
		exportSyntax: 'export',
		asyncSyntax: 'async/await'
	},
	python: {
		name: 'Python',
		frameworks: ['flask', 'django', 'fastapi', 'server'],
		importSyntax: 'from',
		exportSyntax: 'def',
		asyncSyntax: 'async def'
	},
	flutter: {
		name: 'Flutter/Dart',
		frameworks: ['flutter', 'server'],
		importSyntax: 'import',
		exportSyntax: 'class',
		asyncSyntax: 'Future'
	},
	apple: {
		name: 'Apple',
		frameworks: ['vanilla'],
		importSyntax: 'import',
		exportSyntax: 'func',
		asyncSyntax: 'async'
	},
	android: {
		name: 'Android',
		frameworks: ['vanilla'],
		importSyntax: 'import',
		exportSyntax: 'fun',
		asyncSyntax: 'suspend'
	},
	swift: {
		name: 'Swift',
		frameworks: ['server', 'vanilla'],
		importSyntax: 'import',
		exportSyntax: 'func',
		asyncSyntax: 'async'
	},
	kotlin: {
		name: 'Kotlin',
		frameworks: ['server', 'vanilla'],
		importSyntax: 'import',
		exportSyntax: 'fun',
		asyncSyntax: 'suspend'
	},
	php: {
		name: 'PHP',
		frameworks: ['laravel', 'symfony', 'server'],
		importSyntax: 'use',
		exportSyntax: 'function',
		asyncSyntax: 'async'
	},
	go: {
		name: 'Go',
		frameworks: ['gin', 'fiber', 'server'],
		importSyntax: 'import',
		exportSyntax: 'func',
		asyncSyntax: 'goroutine'
	},
	ruby: {
		name: 'Ruby',
		frameworks: ['rails', 'server'],
		importSyntax: 'require',
		exportSyntax: 'def',
		asyncSyntax: 'async'
	},
	dotnet: {
		name: '.NET',
		frameworks: ['aspnet', 'server', 'vanilla'],
		importSyntax: 'using',
		exportSyntax: 'public',
		asyncSyntax: 'async Task'
	}
};

/**
 * @param {GeneratorConfig} config
 * @returns {Promise<string>}
 */
export async function generateRules(config) {
	const { sdk, framework, features } = config;
	const sdkInfo = SDK_OPTIONS[sdk];
	
	const sdkInit = await generateSDKInitialization(sdk, framework);
	
	// Generate all sections in parallel
	const sections = await Promise.all([
		features.includes('auth') ? generateAuthSection(sdk, framework) : Promise.resolve(''),
		features.includes('database') ? generateDatabaseSection(sdk, framework) : Promise.resolve(''),
		features.includes('storage') ? generateStorageSection(sdk, framework) : Promise.resolve(''),
		features.includes('functions') ? generateFunctionsSection(sdk, framework) : Promise.resolve(''),
		features.includes('messaging') ? generateMessagingSection(sdk, framework) : Promise.resolve(''),
		features.includes('sites') ? generateSitesSection(sdk, framework) : Promise.resolve(''),
		features.includes('realtime') ? generateRealtimeSection(sdk, framework) : Promise.resolve('')
	]);
	
	let rules = `---
description: You are an expert developer focused on building apps with Appwrite's ${sdkInfo?.name || sdk} SDK.
alwaysApply: false
---

# Appwrite Development Rules

${generateMCPRecommendation()}

${sdkInit}
${sections.join('\n\n')}
`;

	return rules;
}


/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateSDKInitialization(sdk, framework) {
	/** @type {Record<string, Record<string, string | (() => Promise<string>)>>} */
	const templates = {
		javascript: codeExamples.js,
		'react-native': codeExamples.reactNative,
		python: codeExamples.python,
		php: codeExamples.php,
		go: codeExamples.go,
		flutter: codeExamples.dart,
		apple: codeExamples.apple,
		android: codeExamples.android,
		swift: codeExamples.swift,
		kotlin: codeExamples.kotlin,
		ruby: codeExamples.ruby,
		dotnet: codeExamples.dotnet
	};

	const sdkTemplates = templates[sdk];
	if (sdkTemplates && sdkTemplates[framework]) {
		const template = sdkTemplates[framework];
		// Check if it's an async function
		if (typeof template === 'function') {
			return await template();
		}
		return template;
	}
	
	// Fallback to vanilla if available
	if (sdkTemplates && sdkTemplates.vanilla) {
		const template = sdkTemplates.vanilla;
		// Check if it's an async function
		if (typeof template === 'function') {
			return await template();
		}
		return template;
	}
	
	// Final fallback
	return `## SDK Initialization

Configure your Appwrite client for ${SDK_OPTIONS[sdk]?.name || sdk}.`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateAuthSection(sdk, framework) {
	const { authProductLinks } = await import('./languages/common/products.js');
	return `## Authentication & Teams

${authProductLinks}

### Best Practices for Authentication & Teams

- **Session Security**: Always use HttpOnly cookies for session storage in SSR applications
- **API Keys**: Never expose API keys to client-side code - use environment variables
- **Session Validation**: Always validate sessions on the server before trusting them
- **Team Permissions**: Use team roles for granular access control in multi-tenant applications
- **Multitenancy**: Use team-based permissions when a user requires multitenancy to properly isolate data and resources between tenants
- **OAuth Redirects**: Handle OAuth redirects properly with success and failure URLs
- **Password Security**: Use strong password requirements and consider implementing MFA
- **Session Expiry**: Configure appropriate session expiry times based on your security requirements`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateDatabaseSection(sdk, framework) {
	const { databaseProductLinks } = await import('./languages/common/products.js');
	return `## Database Operations

${databaseProductLinks}

### Best Practices for Databases

- **Permissions**: Always set appropriate permissions at table and row levels
- **Query Optimization**: Use indexes for frequently queried fields to improve performance
- **Data Validation**: Validate data before creating or updating rows
- **Transactions**: Use transactions for operations that must succeed or fail together
- **Pagination**: Always implement pagination for large datasets to improve performance
- **Type Safety**: Use type-safe models when available in your SDK for better code quality`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateStorageSection(sdk, framework) {
	const { storageProductLinks } = await import('./languages/common/products.js');
	return `## Storage Operations

${storageProductLinks}

### Best Practices for Storage

- **File Size Limits**: Set appropriate file size limits to prevent abuse
- **File Types**: Validate file types before upload to ensure security
- **Permissions**: Set proper permissions on buckets and files to control access
- **Cleanup**: Implement cleanup strategies for unused or temporary files
- **Virus Scanning**: Consider implementing virus scanning for uploaded files`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateFunctionsSection(sdk, framework) {
	const { functionsProductLinks } = await import('./languages/common/products.js');
	return `## Functions

${functionsProductLinks}

### Best Practices for Functions

- **Error Handling**: Implement comprehensive error handling in your functions
- **Timeouts**: Be aware of function execution timeouts and optimize accordingly
- **Environment Variables**: Use environment variables for configuration, not hardcoded values
- **Logging**: Implement proper logging for debugging and monitoring
- **Security**: Validate all inputs and never trust user-provided data
- **Resource Limits**: Be mindful of memory and CPU limits for function executions`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateMessagingSection(sdk, framework) {
	const { messagingProductLinks } = await import('./languages/common/products.js');
	return `## Messaging

${messagingProductLinks}

### Best Practices for Messaging

- **Provider Selection**: Choose the right messaging provider based on your needs (FCM, APNS, Mailgun, Twilio, etc.)
- **Message Content**: Keep push notifications concise and actionable
- **Scheduling**: Use scheduled messages for better user engagement timing
- **Personalization**: Personalize messages to increase engagement
- **Rate Limiting**: Be mindful of rate limits when sending bulk messages
- **Error Handling**: Implement retry logic for failed message deliveries`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateSitesSection(sdk, framework) {
	const { sitesProductLinks } = await import('./languages/common/products.js');
	return `## Sites

${sitesProductLinks}

### Best Practices for Sites

- **Environment Variables**: Use environment variables for configuration, not hardcoded values
- **Custom Domains**: Configure custom domains for production sites for better branding
- **Rendering Strategy**: Choose between static and SSR based on your content needs and SEO requirements
- **Deployment Strategy**: Use Git deployments for automatic builds on commits
- **Rollback Plan**: Keep previous deployments ready for instant rollbacks if needed`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateRealtimeSection(sdk, framework) {
	const { realtimeProductLinks } = await import('./languages/common/products.js');
	return `## Real-time Subscriptions

${realtimeProductLinks}

### Best Practices for Real-time Subscriptions

- **Connection Management**: Always unsubscribe from channels when components unmount or pages are closed to prevent memory leaks
- **Error Handling**: Implement reconnection logic for dropped connections and handle network errors gracefully
- **Event Filtering**: Filter events on the client side to only process relevant updates for better performance
- **Channel Selection**: Subscribe only to the specific channels you need to minimize bandwidth and improve performance
- **Payload Validation**: Always validate payload data before processing to ensure data integrity
- **Rate Limiting**: Be mindful of the number of subscriptions and events to avoid overwhelming the client
- **State Synchronization**: Use real-time updates to keep local state in sync with server state, but handle conflicts appropriately
- **Authentication**: Ensure proper authentication is in place before subscribing to protected channels
- **Testing**: Test real-time functionality with network interruptions and reconnection scenarios
- **Cleanup**: Store unsubscribe functions and call them in cleanup hooks (useEffect cleanup, componentWillUnmount, etc.)`;
}

