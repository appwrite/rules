import { rubyInstall } from '../common/install.js';
import { serverSecurityWithConfig } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function server(features = []) {
	const rubyImplementation = getServerImplementationGuide('ruby', features);

	return `${rubyInstall}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/ruby)

${serverSecurityWithConfig('environment variables or Rails credentials')}

${rubyImplementation}

## Ruby-Specific Best Practices

- Use Bundler for dependency management
- Use dotenv-rails or Rails credentials for secrets
- Follow Ruby naming conventions (snake_case)
- Use modules for namespacing services
- Implement proper exception handling with begin/rescue
- Use symbols for hash keys
- Consider using Sorbet or RBS for type checking
`;
}
