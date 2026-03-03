// Rules generator for different Appwrite SDKs and frameworks
import * as codeExamples from './languages/index.js';

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
		frameworks: [
			'nextjs',
			'react',
			'vue',
			'svelte',
			'angular',
			'astro',
			'nuxt',
			'qwik',
			'solid',
			'tanstack',
			'nodejs',
			'vanilla'
		],
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

	const sdkInit = await generateSDKInitialization(sdk, framework, features);

	// Generate all sections in parallel
	// Permissions section is mandatory for all products
	const sections = await Promise.all([
		features.includes('auth') ? generateAuthSection() : Promise.resolve(''),
		generatePermissionsSection(sdk),
		features.includes('database') ? generateDatabaseSection() : Promise.resolve(''),
		features.includes('storage') ? generateStorageSection() : Promise.resolve(''),
		features.includes('functions') ? generateFunctionsSection(sdk) : Promise.resolve(''),
		features.includes('messaging') ? generateMessagingSection() : Promise.resolve(''),
		features.includes('sites') ? generateSitesSection() : Promise.resolve(''),
		features.includes('realtime') ? generateRealtimeSection() : Promise.resolve('')
	]);

	let rules = `# Appwrite Development Rules

> You are an expert developer focused on building apps with Appwrite's ${sdkInfo?.name || sdk} SDK.

## Overview

This file provides AI coding assistants with Appwrite-specific development instructions, best practices, and code patterns for the ${sdkInfo?.name || sdk} SDK${framework !== 'vanilla' ? ` with ${framework}` : ''}.

${sdkInit}
${sections.join('\n\n')}
`;

	return rules;
}

/**
 * @param {string} sdk
 * @param {string} framework
 * @param {string[]} features
 * @returns {Promise<string>}
 */
async function generateSDKInitialization(sdk, framework, features) {
	/** @type {Record<string, Record<string, string | ((features?: string[]) => Promise<string>)>>} */
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
			return await template(features);
		}
		return template;
	}

	// Fallback to vanilla if available
	if (sdkTemplates && sdkTemplates.vanilla) {
		const template = sdkTemplates.vanilla;
		// Check if it's an async function
		if (typeof template === 'function') {
			return await template(features);
		}
		return template;
	}

	// Final fallback
	return `## SDK Initialization

Configure your Appwrite client for ${SDK_OPTIONS[sdk]?.name || sdk}.`;
}

/**
 * @returns {Promise<string>}
 */
async function generateAuthSection() {
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
 * @returns {Promise<string>}
 */
async function generatePermissionsSection(sdk) {
	const { authProductLinks, permissionsProductLinks } = await import(
		'./languages/common/products.js'
	);
	const { getPermissionExamples } = await import('./languages/common/permissions-examples.js');
	const examples = getPermissionExamples(sdk);

	return `## Permissions & Multi-Tenancy

This section is CRITICAL for building secure, scalable applications with Appwrite. Multi-tenancy is one of the most important architectural patterns in modern applications, and Appwrite's team-based permission system is designed specifically for this.

${permissionsProductLinks}

### Why Multi-Tenancy Matters

Multi-tenancy allows a single application instance to serve multiple isolated groups of users (tenants) while maintaining complete data isolation and security. Almost every modern SaaS application requires multi-tenancy to scale efficiently.

### Choosing the Right Permission Model

Use the permission type that matches your use case:

#### User-Specific Permissions
\`\`\`${getLanguageFromSdk(sdk)}
${examples.userPermissions}
\`\`\`

Use when resources are owned by a single user (e.g., user profiles, personal documents, private settings).

#### Team-Based Permissions
\`\`\`${getLanguageFromSdk(sdk)}
${examples.teamPermissions}
\`\`\`

Use when resources are shared across an organization or group. Team members automatically get access based on their role — no need to update permissions per user.

### Team-Based Tenant Isolation

Appwrite handles tenant isolation through its permission system. Set \`Role.team()\` permissions on rows, and Appwrite automatically filters query results so users only see rows they have permission to access. No manual filtering is needed.

\`\`\`${getLanguageFromSdk(sdk)}
${examples.teamIsolation}
\`\`\`

### Multi-Tenancy Implementation Guide

#### Step 1: Create Teams Structure

Teams in Appwrite represent tenants. Each team should map to a business entity (company, organization, workspace).

See: [Teams Documentation](https://appwrite.io/docs/products/auth/teams)

#### Step 2: Define Custom Roles

Common role hierarchy:
- **owner**: Full control, can manage team settings and members
- **admin**: Can manage resources and most settings
- **member**: Can create/edit resources with limited permissions
- **viewer**: Read-only access

#### Step 3: Member Management

For team invitations and membership management, see [Team Invites Guide](https://appwrite.io/docs/products/auth/team-invites)

#### Step 4: Apply Permissions Consistently

Use team roles for all resources:
- **Database rows**: Apply \`Role.team('<TEAM_ID>', 'role')\` permissions
- **Storage files**: Same team-based permission pattern
- **Always include \`teamId\`** as a field in your rows for query filtering

### Permission Best Practices

1. **Always Store teamId**: Every row in a multi-tenant app should have a \`teamId\` field
2. **Default Deny**: Don't grant permissions unless explicitly needed
3. **Role Hierarchy**: Design roles to reflect natural hierarchies (owner > admin > member > viewer)
4. **Server-Side Validation**: Always validate team membership server-side
5. **Query Isolation**: Every multi-tenant query MUST include a \`teamId\` filter

### Common Multi-Tenancy Patterns

| Pattern | Example Apps | Structure |
|---------|--------------|-----------|
| Workspace-Based | Notion, Slack | Each workspace = 1 team, users can belong to multiple teams |
| Organization-Based | GitHub, GitLab | Each org = 1 team, resources scoped to org |
| Project-Based | Linear, Asana | Each project = 1 team, members invited per project |

### Debugging Permission Issues

1. **Check Team Membership**: Verify user is actually a member of the team
2. **Verify Roles**: Check \`membership.roles\` contains the required role
3. **Check Permission Strings**: Permission strings are case-sensitive
4. **Query Filters**: Ensure \`teamId\` filters are applied correctly
5. **Server vs Client**: Some operations require the Server SDK

### Additional Resources

${authProductLinks}`;
}

/**
 * Get language identifier for code blocks based on SDK
 * @param {string} sdk
 * @returns {string}
 */
function getLanguageFromSdk(sdk) {
	/** @type {Record<string, string>} */
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
 * @returns {Promise<string>}
 */
async function generateDatabaseSection() {
	const { databaseProductLinks } = await import('./languages/common/products.js');
	return `## Database Operations

${databaseProductLinks}

### Database Setup Scripts

**ALWAYS create a database setup script using the Server SDK and API key** to initialize your database schema. This script should be version-controlled and run during deployment or initial setup.

**Why Use Setup Scripts:**
- **Infrastructure as Code**: Database schema becomes part of your codebase, not manual console clicks
- **Reproducibility**: Easy to recreate database structure across different environments (dev, staging, production)
- **Version Control**: Track schema changes over time with Git
- **Team Collaboration**: All developers can sync database structure automatically
- **CI/CD Integration**: Automate database setup in deployment pipelines
- **Documentation**: The script serves as living documentation of your database structure

**What Your Setup Script Should Include:**

1. **Table Creation**: All tables with proper naming and IDs
2. **Column Definitions**: All columns with correct data types (string, integer, boolean, datetime, email, url, etc.)
3. **Indexes**: Performance-critical indexes on frequently queried fields (especially \`teamId\`, foreign keys, search fields)
4. **Relationships**: All table relationships and foreign key constraints
5. **Default Permissions**: Table-level permissions using team roles
6. **Column Constraints**: Required fields, string lengths, number ranges, enum values, default values

**Setup Script Requirements:**

- **Use Server SDK**: Must use the Server SDK (node-appwrite, appwrite/appwrite for PHP, etc.), NOT the client SDK
- **Require API Key**: The script must use an API key with appropriate scopes (\`databases.write\`, \`tables.write\`, \`columns.write\`)
- **Idempotent**: Script should safely handle re-runs (check if tables exist before creating)
- **Environment Variables**: Store API key, endpoint, project ID, and database ID in environment variables
- **Error Handling**: Proper error handling with clear error messages
- **Logging**: Log progress and errors for debugging

**Example Setup Script Structure:**

\`\`\`${getLanguageFromSdk('javascript')}
// scripts/setup-database.js (Node.js example)
import { Client, TablesDB, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

async function setupDatabase() {
    try {
        // Create Users table
        await tablesDB.createTable(databaseId, 'users', 'Users', [
            Permission.read(Role.users()),
            Permission.write(Role.users())
        ]);
        
        // Add columns to Users table
        await tablesDB.createVarcharColumn(databaseId, 'users', 'name', 255, true);
        await tablesDB.createEmailColumn(databaseId, 'users', 'email', true);
        await tablesDB.createVarcharColumn(databaseId, 'users', 'teamId', 255, true);
        
        // Create index on teamId for query performance
        await tablesDB.createIndex(databaseId, 'users', 'idx_team', 'key', ['teamId']);
        
        // Create Projects table with team-based permissions
        await tablesDB.createTable(databaseId, 'projects', 'Projects', [
            Permission.read(Role.team('[TEAM_ID]')),
            Permission.create(Role.team('[TEAM_ID]', 'member')),
            Permission.update(Role.team('[TEAM_ID]', 'admin')),
            Permission.delete(Role.team('[TEAM_ID]', 'owner')),
        ]);
        
        // Add columns to Projects table
        await tablesDB.createVarcharColumn(databaseId, 'projects', 'name', 255, true);
        await tablesDB.createTextColumn(databaseId, 'projects', 'description', false);
        await tablesDB.createVarcharColumn(databaseId, 'projects', 'teamId', 255, true);
        await tablesDB.createVarcharColumn(databaseId, 'projects', 'ownerId', 255, true);
        await tablesDB.createDatetimeColumn(databaseId, 'projects', 'createdAt', true);
        
        // Create indexes
        await tablesDB.createIndex(databaseId, 'projects', 'idx_team', 'key', ['teamId']);
        await tablesDB.createIndex(databaseId, 'projects', 'idx_owner', 'key', ['ownerId']);
        
        // Create relationship between projects and users
        await tablesDB.createRelationshipColumn(
            databaseId, 
            'projects', 
            'users', 
            'oneToMany',
            false, // twoWay
            'owner', // key in projects
            'projects', // key in users
            'cascade' // onDelete
        );
        
        console.log('Database setup completed successfully!');
    } catch (error) {
        // Handle "already exists" errors gracefully for idempotency
        if (error.code !== 409) {
            console.error('Database setup failed:', error);
            throw error;
        } else {
            console.log('Tables already exist, skipping creation');
        }
    }
}

setupDatabase();
\`\`\`

**Running the Setup Script:**

\`\`\`bash
# Set environment variables
export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="your-project-id"
export APPWRITE_API_KEY="your-api-key"
export APPWRITE_DATABASE_ID="your-database-id"

# Run the setup script
node scripts/setup-database.js
\`\`\`

**Best Practices for Setup Scripts:**

1. **Separate File**: Keep setup scripts in a \`scripts/\` directory
2. **Documentation**: Add comments explaining each table's purpose and relationships
3. **Testing**: Test the script on a separate development database before production
4. **Migration Strategy**: For schema changes, create new migration scripts instead of modifying the original setup
5. **Backup First**: Always backup production data before running schema changes
6. **Team ID Fields**: Always include \`teamId\` fields in multi-tenant tables
7. **Timestamp Fields**: Include \`createdAt\` and \`updatedAt\` fields for auditing
8. **Foreign Keys**: Use relationship columns to enforce referential integrity

### Best Practices for TablesDB

- **SDK Usage**: Use the \`TablesDB\` service (formerly \`Databases\`) for all database operations
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
 * @returns {Promise<string>}
 */
async function generateStorageSection() {
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
 * @returns {Promise<string>}
 */
async function generateFunctionsSection(sdk) {
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
 * @returns {Promise<string>}
 */
async function generateMessagingSection() {
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
 * @returns {Promise<string>}
 */
async function generateSitesSection() {
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
 * @returns {Promise<string>}
 */
async function generateRealtimeSection() {
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
