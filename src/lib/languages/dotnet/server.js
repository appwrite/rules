import { dotnetInstall } from '../common/install.js';
import { serverSecurityWithConfig } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function server(features = []) {
	const dotnetImplementation = getServerImplementationGuide('dotnet', features);

	return `${dotnetInstall}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/dotnet)

${serverSecurityWithConfig('configuration files (appsettings.json) or environment variables')}

${dotnetImplementation}

## .NET-Specific Best Practices

- Use dependency injection (built-in or Autofac)
- Store secrets in User Secrets (dev) or Azure Key Vault (prod)
- Use async/await for all I/O operations
- Use IOptions<T> pattern for configuration
- Implement IDisposable for cleanup
- Use records for immutable data models
- Follow C# naming conventions (PascalCase for public members)
`;
}
