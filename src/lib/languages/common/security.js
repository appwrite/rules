/**
 * Common security best practices and guidelines
 */

/**
 * Client-side security best practices (for web frameworks)
 */
export const clientSecurity = `**Best Practices:**
- Store endpoint and project ID in environment variables
- Never commit API keys to version control
- Initialize services once and export as singletons`;

/**
 * Client-side security with environment variable note
 * @param {string} envFile - Environment file name (e.g., '.env.local', '.env')
 */
export const clientSecurityWithEnv = (envFile = '.env.local') => `**Best Practices:**
- Store endpoint and project ID in environment variables (${envFile})
- Never commit API keys to version control
- Initialize services once and export as singletons`;

/**
 * Server-side security best practices
 */
export const serverSecurity = `**Security:**
- API keys should NEVER be exposed to client-side code
- Use environment variables for all sensitive configuration
- API keys grant admin access - use with extreme caution`;

/**
 * Server-side security with framework-specific config note
 * @param {string} configMethod - Configuration method (e.g., "configuration files or environment variables", "Rails credentials")
 */
export const serverSecurityWithConfig = (configMethod = 'environment variables') => `**Security:**
- API keys should NEVER be exposed to client-side code
- Use ${configMethod} for configuration
- API keys grant admin access - use with extreme caution`;

/**
 * Authentication-specific notes
 */
export const authNote = `**Authentication:**
- Prefer SSR auth for better security and performance`;

/**
 * Framework-specific notes
 */
export const frameworkNotes = {
	angular: `**Best Practices:**
- Store endpoint and project ID in environment variables
- Never commit API keys to version control
- Use Angular services for dependency injection

${authNote}`,
	
	nodejs: `**Best Practices:**
- Store endpoint and project ID in environment variables
- Never commit API keys to version control
- Use environment variables for configuration
- API keys grant admin access - use with extreme caution`
};

