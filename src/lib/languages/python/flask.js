import { createSecuritySection } from '../common/utils.js';

export const flask = createSecuritySection({
	securityNotes: `**Best Practices:**
- Use environment variables for configuration
- Never commit API keys to version control`
});

