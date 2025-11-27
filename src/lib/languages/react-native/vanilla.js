import { jsInstall } from '../common/install.js';
import { createFrameworkTemplate } from '../common/utils.js';

export const vanilla = createFrameworkTemplate({
	installation: jsInstall('react-native-appwrite', 'Install the Appwrite React Native SDK'),
	securityNotes: `**Best Practices:**
- Store endpoint and project ID in environment variables or config files
- Never commit API keys to version control
- Initialize services once and export as singletons`
});

