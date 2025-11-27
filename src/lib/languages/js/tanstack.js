import { jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';
import { authNote } from '../common/security.js';

export const tanstack = createFrameworkTemplate({
	installation: jsInstall('appwrite @tanstack/react-query', 'Install the Appwrite JavaScript SDK and TanStack Query'),
	securityNotes: `For TanStack Query integration examples and best practices, refer to the [TanStack Query Documentation](https://tanstack.com/query/latest).

**Best Practices:**
- Use query keys consistently for cache management
- Invalidate queries after mutations to keep data fresh
- Use \`enabled\` option to conditionally fetch data
- Store endpoint and project ID in environment variables
- Never commit API keys to version control`,
	additionalNotes: authNote
});

