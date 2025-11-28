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
 * @property {boolean} [includeMCP] - Whether to include MCP recommendation section
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
	const { sdk, framework, features, includeMCP = false } = config;
	const sdkInfo = SDK_OPTIONS[sdk];
	
	const sdkInit = await generateSDKInitialization(sdk, framework);
	
	// Generate all sections in parallel
	// Permissions section is mandatory for all products
	const sections = await Promise.all([
		features.includes('auth') ? generateAuthSection(sdk, framework) : Promise.resolve(''),
		generatePermissionsSection(sdk, framework),
		features.includes('database') ? generateDatabaseSection(sdk, framework) : Promise.resolve(''),
		features.includes('storage') ? generateStorageSection(sdk, framework) : Promise.resolve(''),
		features.includes('functions') ? generateFunctionsSection(sdk, framework) : Promise.resolve(''),
		features.includes('messaging') ? generateMessagingSection(sdk, framework) : Promise.resolve(''),
		features.includes('sites') ? generateSitesSection(sdk, framework) : Promise.resolve(''),
		features.includes('realtime') ? generateRealtimeSection(sdk, framework) : Promise.resolve('')
	]);
	
	const mcpSection = includeMCP ? `${generateMCPRecommendation()}\n\n` : '';
	
	let rules = `---
description: You are an expert developer focused on building apps with Appwrite's ${sdkInfo?.name || sdk} SDK.
alwaysApply: false
---

# Appwrite Development Rules

${mcpSection}${sdkInit}
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
- **Team-Based Architecture**: ALWAYS prefer team/member-based roles over user-specific roles for any application requiring shared access or multi-tenancy
- **Multi-Tenant Applications**: Use teams as the primary mechanism for tenant isolation and resource sharing
- **OAuth Redirects**: Handle OAuth redirects properly with success and failure URLs
- **Password Security**: Use strong password requirements and consider implementing MFA
- **Session Expiry**: Configure appropriate session expiry times based on your security requirements

### Team & Member Management Fundamentals

When building applications that involve multiple users or tenants:

1. **Always Start with Teams**: For any feature requiring shared access, create a team first, then add members with roles
2. **Role-Based Access**: Assign roles (e.g., "owner", "admin", "member", "viewer") to team members rather than setting individual user permissions
3. **Team Isolation**: Use teams as the boundary for data isolation in multi-tenant applications
4. **Member Invitations**: Implement team invitation workflows for onboarding new members
5. **Role Management**: Build role management UIs that allow team owners/admins to manage member roles dynamically`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generatePermissionsSection(sdk, framework) {
	const { authProductLinks } = await import('./languages/common/products.js');
	const { getPermissionExamples } = await import('./languages/common/permissions-examples.js');
	const examples = getPermissionExamples(sdk);
	
	return `## Permissions & Multi-Tenancy

This section is CRITICAL for building secure, scalable applications with Appwrite. Multi-tenancy is one of the most important architectural patterns in modern applications, and Appwrite's team-based permission system is designed specifically for this.

### Why Multi-Tenancy Matters

Multi-tenancy allows a single application instance to serve multiple isolated groups of users (tenants) while maintaining complete data isolation and security. Almost every modern SaaS application requires multi-tenancy to scale efficiently.

### Team/Member Roles vs User-Specific Roles: The Critical Distinction

**ALWAYS PREFER TEAM/MEMBER-BASED ROLES over user-specific roles.** This is a fundamental architectural decision:

#### Avoid: User-Specific Permissions
\`\`\`${getLanguageFromSdk(sdk)}
${examples.avoidUserPermissions}
\`\`\`

**Problems with user-specific permissions:**
- Hard to scale when users need to share resources
- Difficult to add/remove access without updating every row
- No way to represent organizational hierarchies
- Poor support for collaborative features
- Maintenance nightmare as teams grow

#### Prefer: Team/Member-Based Roles
\`\`\`${getLanguageFromSdk(sdk)}
${examples.preferTeamPermissions}
\`\`\`

**Benefits of team/member-based roles:**
- Automatic access for all team members based on their role
- Easy to add/remove members without touching rows
- Scales naturally as teams grow
- Supports organizational hierarchies and complex permissions
- Industry-standard pattern for SaaS applications

### Building Multi-Tenant Applications from Scratch

#### Step 1: Create Teams Structure

Teams in Appwrite represent tenants. Each team should map to a business entity (company, organization, workspace, etc.).

**Creating a team:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.createTeam}
\`\`\`

#### Step 2: Define Custom Roles

Create roles that match your application's permission model. Common roles:
- **owner**: Full control, can manage team settings and members
- **admin**: Can manage resources and most settings, but not team membership
- **member**: Can create/edit resources, but with limited permissions
- **viewer**: Read-only access

**Creating custom roles (Server-side only):**
\`\`\`${getLanguageFromSdk(sdk)}
// Define roles when creating the team (optional, defaults exist)
// Or create via Appwrite Console or Server SDK
// Roles are created per team, allowing different permission models per tenant
\`\`\`

#### Step 3: Member Management from Scratch

Member management is the foundation of multi-tenant applications. Here's how to build it:

**A. Invite Members to Teams**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.createMembershipEmail}
\`\`\`

\`\`\`${getLanguageFromSdk(sdk)}
${examples.createMembershipUserId}
\`\`\`

**B. List Team Members**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.listMemberships}
\`\`\`

**C. Update Member Roles**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.updateMembership}
\`\`\`

**D. Remove Members**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.deleteMembership}
\`\`\`

**E. Get Current User's Teams**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.listTeams}
\`\`\`

**F. Get Current User's Role in a Team**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.getUserRole}
\`\`\`

#### Step 4: Apply Permissions in Tables

When creating rows in multi-tenant applications, always use team roles:

**Database Tables:**

\`\`\`${getLanguageFromSdk(sdk)}
${examples.createRow}
\`\`\`

**Table-Level Permissions:**

When creating tables, set default permissions:

\`\`\`${getLanguageFromSdk(sdk)}
${examples.createTable}
\`\`\`

#### Step 5: Query with Team Isolation

Always filter queries by teamId to ensure data isolation:

\`\`\`${getLanguageFromSdk(sdk)}
${examples.listRows}
\`\`\`

#### Step 6: Storage Permissions

Apply the same team-based permission pattern to storage:

\`\`\`${getLanguageFromSdk(sdk)}
${examples.createFile}
\`\`\`

### Complete Member Management Implementation Pattern

Here's a complete pattern for building member management UI and logic:

**1. Team Creation Flow:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.teamCreationFlow}
\`\`\`

**2. Invite Flow:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.inviteFlow}
\`\`\`

**3. Member List UI:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.memberListUI}
\`\`\`

**4. Role Change:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.roleChange}
\`\`\`

**5. Member Removal:**
\`\`\`${getLanguageFromSdk(sdk)}
${examples.memberRemoval}
\`\`\`

### Permission Best Practices

1. **Always Store teamId**: Every row/resource in a multi-tenant app should have a \`teamId\` field for filtering and isolation

2. **Default Deny**: Don't grant permissions unless explicitly needed. Use minimal permission sets.

3. **Role Hierarchy**: Design your roles to reflect natural hierarchies (owner > admin > member > viewer)

4. **Permission Consistency**: Use the same permission pattern across database, storage, and other resources

5. **Server-Side Validation**: Always validate team membership on the server side, even if client has permissions

6. **Query Isolation**: Always include \`teamId\` in queries to prevent cross-tenant data leaks

7. **Role Checks**: Before allowing sensitive operations, check the user's role in the team:
   \`\`\`${getLanguageFromSdk(sdk)}
${examples.roleCheck}
   \`\`\`

8. **Permission Inheritance**: Consider if child resources should inherit parent team permissions

9. **Row-Level Permissions**: For fine-grained control, set permissions on individual rows while still using team roles

10. **Audit Trail**: Log permission changes and team membership changes for security auditing

### Common Multi-Tenancy Patterns

**Pattern 1: Workspace-Based (e.g., Notion, Slack)**
- Each workspace is a team
- Users can belong to multiple teams
- Resources belong to one team
- Perfect for: Collaboration tools, project management

**Pattern 2: Organization-Based (e.g., GitHub, GitLab)**
- Each organization is a team
- Resources belong to organization
- Members have roles within organization
- Perfect for: Enterprise SaaS, developer tools

**Pattern 3: Project-Based (e.g., Linear, Asana)**
- Each project is a team
- Resources scoped to project
- Members invited per project
- Perfect for: Project management, task tracking

### Debugging Permission Issues

When permissions aren't working:

1. **Check Team Membership**: Verify user is actually a member of the team
2. **Verify Roles**: Ensure user has the required role (check \`membership.roles\`)
3. **Check Permission Strings**: Verify permission strings match exactly (case-sensitive)
4. **Query Filters**: Ensure \`teamId\` filters are applied correctly
5. **Server vs Client**: Some operations require server SDK (like creating custom roles)
6. **Session Context**: Permissions are evaluated in the context of the current session

### Additional Resources

${authProductLinks}

For comprehensive permission patterns and examples, always refer to the official Appwrite documentation on Teams, Multi-tenancy, and Permissions.`;
}

/**
 * Get language identifier for code blocks based on SDK
 * @param {string} sdk
 * @returns {string}
 */
function getLanguageFromSdk(sdk) {
	const languageMap = {
		javascript: 'javascript',
		'react-native': 'javascript',
		python: 'python',
		php: 'php',
		go: 'go',
		flutter: 'dart',
		dart: 'dart',
		apple: 'swift',
		android: 'kotlin',
		swift: 'swift',
		kotlin: 'kotlin',
		ruby: 'ruby',
		dotnet: 'csharp'
	};
	return languageMap[sdk] || 'javascript';
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

- **SDK Usage**: Always use \`TablesDB\` instead of \`Databases\` in the SDKs
- **Permissions & Multi-Tenancy**: ALWAYS use team/member-based roles for permissions (see Permissions & Multi-Tenancy section above). Never use user-specific permissions in multi-tenant applications
- **Tenant Isolation**: Always include \`teamId\` fields in your rows and filter queries by \`teamId\` to ensure complete data isolation between tenants
- **Permission Patterns**: Apply team roles (owner, admin, member, viewer) consistently across all tables. Use Role.team() for all permission checks
- **Query Security**: Every multi-tenant query MUST include a \`teamId\` filter to prevent cross-tenant data access
- **Table Permissions**: Set table-level permissions using team roles, then override at row level when needed
- **Query Optimization**: Use indexes for frequently queried fields, especially on \`teamId\` and commonly filtered fields
- **Data Validation**: Validate data before creating or updating rows, including team membership validation
- **Transactions**: Use transactions for operations that must succeed or fail together, ensuring atomicity across tenant boundaries
- **Pagination**: Always implement pagination for large datasets to improve performance and reduce response sizes
- **Type Safety**: Use type-safe models when available in your SDK for better code quality and fewer runtime errors`;
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

- **Permissions & Multi-Tenancy**: ALWAYS use team/member-based roles for storage permissions (see Permissions & Multi-Tenancy section above). Apply Role.team() permissions to buckets and files for proper tenant isolation
- **Bucket Organization**: Consider organizing files by team/tenant using folder structures or bucket naming conventions for easier management
- **Tenant Isolation**: When querying files, always filter by metadata (e.g., \`teamId\`) to ensure users only access files from their teams
- **File Size Limits**: Set appropriate file size limits to prevent abuse and manage costs
- **File Types**: Validate file types before upload to ensure security and prevent malicious uploads
- **Permission Patterns**: Use team roles (owner, admin, member, viewer) consistently for bucket and file permissions, matching your database permission model
- **Cleanup**: Implement cleanup strategies for unused or temporary files, especially when teams are deleted
- **Virus Scanning**: Consider implementing virus scanning for uploaded files to protect all tenants
- **Access Control**: Validate team membership before allowing file uploads/downloads, even if permissions are set correctly`;
}

/**
 * Maps SDK names to their corresponding template paths in the Appwrite templates repository
 * @param {string} sdk
 * @returns {string|null} Template path or null if no template available
 */
function getFunctionTemplatePath(sdk) {
	/** @type {Record<string, string>} */
	const templateMap = {
		javascript: 'node/starter',
		'react-native': 'node/starter',
		python: 'python/starter',
		php: 'php/starter',
		go: 'go/starter',
		flutter: 'dart/starter',
		swift: 'swift/starter',
		kotlin: 'kotlin/starter',
		ruby: 'ruby/starter',
		dotnet: 'dotnet/starter'
	};
	return templateMap[sdk] || null;
}

/**
 * Generates template links section for functions
 * @param {string} sdk
 * @returns {string}
 */
function generateFunctionTemplateLinks(sdk) {
	const templatePath = getFunctionTemplatePath(sdk);
	if (!templatePath) {
		return '';
	}
	
	const templateUrl = `https://github.com/appwrite/templates/tree/main/${templatePath}`;
	const templatesBaseUrl = 'https://github.com/appwrite/templates';
	
	return `### Starter Templates

For getting started with Appwrite Functions, use the official starter template for your runtime:

- **${SDK_OPTIONS[sdk]?.name || sdk} Starter**: [View Template](${templateUrl})

For more templates and examples, see the [Appwrite Templates Repository](${templatesBaseUrl}).`;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @returns {Promise<string>}
 */
async function generateFunctionsSection(sdk, framework) {
	const { functionsProductLinks } = await import('./languages/common/products.js');
	const templateLinks = generateFunctionTemplateLinks(sdk);
	
	return `## Functions

${functionsProductLinks}

${templateLinks}

### When to Use Starter Templates

**ALWAYS use starter templates from the [Appwrite Templates Repository](https://github.com/appwrite/templates) when building functions for:**

- **Scheduled Tasks**: Functions that run on a schedule (cron jobs, periodic cleanup, etc.)
- **Event-Driven Tasks**: Functions triggered by Appwrite events (database changes, storage uploads, user events, etc.)
- **Background Processing**: Long-running or resource-intensive operations
- **Integration Functions**: Functions that integrate with third-party services (APIs, webhooks, etc.)
- **Complex Functions**: Any function that requires specific runtime configuration or dependencies

**Why use templates?** Starter templates provide the correct project structure, dependencies, and configuration needed for functions to build and execute successfully. They ensure proper handling of environment variables, logging, error handling, and Appwrite SDK initialization.

### Best Practices for Functions

- **Error Handling**: Implement comprehensive error handling in your functions
- **Timeouts**: Be aware of function execution timeouts and optimize accordingly
- **Environment Variables**: Use environment variables for configuration, not hardcoded values
- **Logging**: Implement proper logging for debugging and monitoring
- **Security**: Validate all inputs and never trust user-provided data
- **Resource Limits**: Be mindful of memory and CPU limits for function executions
- **Template Usage**: Start with official templates for scheduled and event-driven functions to ensure proper setup`;
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
	return `## Realtime Subscriptions

${realtimeProductLinks}

### Best Practices for Realtime Subscriptions

- **Connection Management**: Always unsubscribe from channels when components unmount or pages are closed to prevent memory leaks
- **Error Handling**: Implement reconnection logic for dropped connections and handle network errors gracefully
- **Event Filtering**: Filter events on the client side to only process relevant updates for better performance
- **Channel Selection**: Subscribe only to the specific channels you need to minimize bandwidth and improve performance
- **Payload Validation**: Always validate payload data before processing to ensure data integrity
- **Rate Limiting**: Be mindful of the number of subscriptions and events to avoid overwhelming the client
- **State Synchronization**: Use realtime updates to keep local state in sync with server state, but handle conflicts appropriately
- **Authentication**: Ensure proper authentication is in place before subscribing to protected channels
- **Testing**: Test realtime functionality with network interruptions and reconnection scenarios
- **Cleanup**: Store unsubscribe functions and call them in cleanup hooks (useEffect cleanup, componentWillUnmount, etc.)`;
}

