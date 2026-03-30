import { pythonInstall } from '../common/install.js';
import { serverSecurity } from '../common/security.js';
import { getServerImplementationGuide } from '../common/implementation-patterns.js';

export async function server(features = []) {
	const pythonImplementation = getServerImplementationGuide('python', features);

	return `${pythonInstall}

**Framework Documentation:**
- [Users API](https://appwrite.io/docs/references/cloud/server-nodejs/users) - User management and administration
- [Databases API](https://appwrite.io/docs/references/cloud/server-nodejs/databases) - Database operations
- [Storage API](https://appwrite.io/docs/references/cloud/server-nodejs/storage) - File storage and management
- [Functions API](https://appwrite.io/docs/references/cloud/server-nodejs/functions) - Serverless functions management
- [Messaging API](https://appwrite.io/docs/references/cloud/server-nodejs/messaging) - Email, SMS, and push notifications
- [Appwrite Quick Start](https://appwrite.io/docs/quick-starts/python)

${serverSecurity}

${pythonImplementation}

## Python-Specific Best Practices

- Use virtual environments (venv, poetry, pipenv)
- Type hints for better IDE support and documentation
- Use async/await with asyncio for concurrent operations
- Store configuration in environment variables (.env with python-dotenv)
- Use dataclasses or Pydantic for models
- Implement proper exception handling with try/except
`;
}
