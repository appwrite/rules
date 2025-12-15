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
 * SSR Authentication pattern
 */
export const ssrAuthPattern = `**SSR Authentication Pattern:**

Server-side rendering requires using the Server SDK (node-appwrite) instead of the client SDK.

**Authentication Flow:**
1. User credentials are sent from browser to your server
2. Your server authenticates with Appwrite using the Server SDK
3. Appwrite returns a session object
4. Store the session secret in an httpOnly cookie
5. Subsequent requests include the session cookie
6. Your server makes authenticated requests on behalf of the user

**Key Implementation Details:**

**Initialize Two Clients:**
- **Admin Client**: Uses API key for unauthenticated requests and session creation
- **Session Client**: Uses session cookie for user-specific requests

**Creating Sessions:**
\`\`\`javascript
import { Client, Account } from "node-appwrite";

// In your login endpoint:
const account = new Account(adminClient);
const session = await account.createEmailPasswordSession(email, password);

// Set httpOnly cookie with session secret
res.cookie('a_session_<PROJECT_ID>', session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(session.expire),
    path: '/'
});
\`\`\`

**Making Authenticated Requests:**
\`\`\`javascript
// Read session from cookie
const session = req.cookies['a_session_<PROJECT_ID>'];

// Create session client
const sessionClient = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setSession(session);

const account = new Account(sessionClient);
const user = await account.get();
\`\`\`

**OAuth2 Flow:**
1. Redirect to OAuth provider using createOAuth2Token
2. Handle callback with userId and secret parameters
3. Call createSession to exchange for session object
4. Store session secret in cookie

**Best Practices:**
- Use httpOnly, secure, and sameSite cookie flags
- Create new session client per request
- Never share clients between requests
- Use API key for admin client to bypass rate limits
- Set forwarded user agent for better session tracking

**See full SSR auth guide:** https://appwrite.io/docs/products/auth/server-side-rendering`;

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

