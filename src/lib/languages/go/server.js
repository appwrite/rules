import { goInstall } from '../common/install.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function server(features = []) {
	const goImplementation = getServerImplementationGuide('go', features);

	return `${goInstall}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/go)

${serverSecurity}

${goImplementation}

## Go-Specific Best Practices

- Use Go modules for dependency management
- Use godotenv or similar for environment variables
- Create interfaces for testability
- Use context.Context for request cancellation
- Handle errors explicitly (don't ignore returned errors)
- Use goroutines carefully with proper synchronization
- Implement graceful shutdown for servers
`;
}
