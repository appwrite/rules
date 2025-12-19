import { dotnetInstall } from '../common/install.js';
import { clientSecurity } from '../common/security.js';

export const vanilla = `${dotnetInstall}

**Framework Documentation:**
- [Account API](https://appwrite.io/docs/references/cloud/client-web/account) - Authentication and user management
- [Databases API](https://appwrite.io/docs/references/cloud/client-web/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/client-web/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/client-web/functions) - Serverless functions execution
- [Messaging API](https://appwrite.io/docs/references/cloud/client-web/messaging) - Push notifications and messaging
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/dotnet)

${clientSecurity}

## .NET Client Best Practices

- Use the SDK in console apps, desktop apps (WPF, WinForms, MAUI)
- Store configuration in appsettings.json or user secrets
- Use async/await for all SDK operations
- Implement proper error handling with try/catch
`;
