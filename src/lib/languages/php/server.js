import { phpInstall } from '../common/install.js';
import { serverSecurityWithConfig } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function server(features = []) {
	const phpImplementation = getServerImplementationGuide('php', features);

	return `${phpInstall}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/php)

${serverSecurityWithConfig('environment variables or .env files')}

${phpImplementation}

## PHP-Specific Best Practices

- Use Composer for dependency management
- Use PHP 8.1+ for better type support and enums
- Use vlucas/phpdotenv for environment variables
- Implement PSR-4 autoloading
- Use dependency injection containers (Laravel, Symfony)
- Handle exceptions with try/catch blocks
- Use strict typing with \`declare(strict_types=1)\`
`;
}
