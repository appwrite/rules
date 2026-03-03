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
 * SSR Authentication pattern (language-agnostic explanation)
 * Use this for the conceptual overview, then pair with language-specific examples
 */
export const ssrAuthPatternExplanation = `**SSR Authentication Pattern:**

Server-side rendering requires using the Server SDK instead of the client SDK.

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

**Best Practices:**
- Use httpOnly, secure, and sameSite cookie flags
- Create new session client per request
- Never share clients between requests
- Use API key for admin client to bypass rate limits
- Set forwarded user agent for better session tracking

**See full SSR auth guide:** https://appwrite.io/docs/products/auth/server-side-rendering`;

/**
 * SSR Auth code examples by language
 */
const ssrAuthExamples = {
	javascript: {
		createSession: `import { Client, Account } from "node-appwrite";

// In your login endpoint:
const account = new Account(adminClient);
const session = await account.createEmailPasswordSession({ email, password });

// Set httpOnly cookie with session secret
res.cookie('a_session_<PROJECT_ID>', session.secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(session.expire),
    path: '/'
});`,
		useSession: `// Read session from cookie
const session = req.cookies['a_session_<PROJECT_ID>'];

// Create session client
const sessionClient = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setSession(session);

const account = new Account(sessionClient);
const user = await account.get();`
	},
	python: {
		createSession: `from appwrite.client import Client
from appwrite.services.account import Account

# In your login endpoint:
account = Account(admin_client)
session = account.create_email_password_session(email, password)

# Set httpOnly cookie with session secret
response.set_cookie(
    'a_session_<PROJECT_ID>',
    session['secret'],
    httponly=True,
    secure=True,
    samesite='strict',
    expires=session['expire'],
    path='/'
)`,
		useSession: `# Read session from cookie
session = request.cookies.get('a_session_<PROJECT_ID>')

# Create session client
session_client = Client()
session_client.set_endpoint('https://cloud.appwrite.io/v1')
session_client.set_project('<PROJECT_ID>')
session_client.set_session(session)

account = Account(session_client)
user = account.get()`
	},
	php: {
		createSession: `use Appwrite\\Client;
use Appwrite\\Services\\Account;

// In your login endpoint:
$account = new Account($adminClient);
$session = $account->createEmailPasswordSession($email, $password);

// Set httpOnly cookie with session secret
setcookie(
    'a_session_<PROJECT_ID>',
    $session['secret'],
    [
        'httponly' => true,
        'secure' => true,
        'samesite' => 'Strict',
        'expires' => strtotime($session['expire']),
        'path' => '/'
    ]
);`,
		useSession: `// Read session from cookie
$session = $_COOKIE['a_session_<PROJECT_ID>'] ?? null;

// Create session client
$sessionClient = new Client();
$sessionClient
    ->setEndpoint('https://cloud.appwrite.io/v1')
    ->setProject('<PROJECT_ID>')
    ->setSession($session);

$account = new Account($sessionClient);
$user = $account->get();`
	},
	ruby: {
		createSession: `require 'appwrite'

# In your login endpoint:
account = Appwrite::Account.new(admin_client)
session = account.create_email_password_session(email: email, password: password)

# Set httpOnly cookie with session secret
cookies['a_session_<PROJECT_ID>'] = {
  value: session['secret'],
  httponly: true,
  secure: true,
  same_site: :strict,
  expires: Time.parse(session['expire']),
  path: '/'
}`,
		useSession: `# Read session from cookie
session = cookies['a_session_<PROJECT_ID>']

# Create session client
session_client = Appwrite::Client.new
session_client
  .set_endpoint('https://cloud.appwrite.io/v1')
  .set_project('<PROJECT_ID>')
  .set_session(session)

account = Appwrite::Account.new(session_client)
user = account.get`
	},
	go: {
		createSession: `import (
    "github.com/appwrite/sdk-for-go/appwrite"
)

// In your login endpoint:
account := appwrite.NewAccount(adminClient)
session, _ := account.CreateEmailPasswordSession(email, password)

// Set httpOnly cookie with session secret
http.SetCookie(w, &http.Cookie{
    Name:     "a_session_<PROJECT_ID>",
    Value:    session.Secret,
    HttpOnly: true,
    Secure:   true,
    SameSite: http.SameSiteStrictMode,
    Expires:  session.Expire,
    Path:     "/",
})`,
		useSession: `// Read session from cookie
cookie, _ := r.Cookie("a_session_<PROJECT_ID>")

// Create session client
sessionClient := appwrite.NewClient()
sessionClient.SetEndpoint("https://cloud.appwrite.io/v1")
sessionClient.SetProject("<PROJECT_ID>")
sessionClient.SetSession(cookie.Value)

account := appwrite.NewAccount(sessionClient)
user, _ := account.Get()`
	},
	dotnet: {
		createSession: `using Appwrite;
using Appwrite.Services;

// In your login endpoint:
var account = new Account(adminClient);
var session = await account.CreateEmailPasswordSession(email, password);

// Set httpOnly cookie with session secret
Response.Cookies.Append("a_session_<PROJECT_ID>", session.Secret, new CookieOptions
{
    HttpOnly = true,
    Secure = true,
    SameSite = SameSiteMode.Strict,
    Expires = DateTimeOffset.Parse(session.Expire),
    Path = "/"
});`,
		useSession: `// Read session from cookie
var session = Request.Cookies["a_session_<PROJECT_ID>"];

// Create session client
var sessionClient = new Client()
    .SetEndpoint("https://cloud.appwrite.io/v1")
    .SetProject("<PROJECT_ID>")
    .SetSession(session);

var account = new Account(sessionClient);
var user = await account.Get();`
	},
	kotlin: {
		createSession: `import io.appwrite.Client
import io.appwrite.services.Account

// In your login endpoint:
val account = Account(adminClient)
val session = account.createEmailPasswordSession(email, password)

// Set httpOnly cookie with session secret
call.response.cookies.append(
    name = "a_session_<PROJECT_ID>",
    value = session.secret,
    httpOnly = true,
    secure = true,
    extensions = mapOf("SameSite" to "Strict"),
    expires = GMTDate(session.expire),
    path = "/"
)`,
		useSession: `// Read session from cookie
val session = call.request.cookies["a_session_<PROJECT_ID>"]

// Create session client
val sessionClient = Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession(session)

val account = Account(sessionClient)
val user = account.get()`
	},
	swift: {
		createSession: `import Appwrite

// In your login endpoint:
let account = Account(adminClient)
let session = try await account.createEmailPasswordSession(email: email, password: password)

// Set httpOnly cookie with session secret
response.cookies["a_session_<PROJECT_ID>"] = HTTPCookie(
    name: "a_session_<PROJECT_ID>",
    value: session.secret,
    httpOnly: true,
    secure: true,
    sameSite: .strict,
    expires: session.expire,
    path: "/"
)`,
		useSession: `// Read session from cookie
let session = request.cookies["a_session_<PROJECT_ID>"]

// Create session client
let sessionClient = Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setSession(session)

let account = Account(sessionClient)
let user = try await account.get()`
	},
	dart: {
		createSession: `import 'package:dart_appwrite/dart_appwrite.dart';

// In your login endpoint:
final account = Account(adminClient);
final session = await account.createEmailPasswordSession(
  email: email,
  password: password,
);

// Set httpOnly cookie with session secret
response.headers.add(
  'Set-Cookie',
  'a_session_<PROJECT_ID>=\${session.secret}; HttpOnly; Secure; SameSite=Strict; Path=/',
);`,
		useSession: `// Read session from cookie
final session = request.headers['Cookie']
    ?.split('; ')
    .firstWhere((c) => c.startsWith('a_session_<PROJECT_ID>='))
    ?.split('=')[1];

// Create session client
final sessionClient = Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('<PROJECT_ID>')
    .setSession(session);

final account = Account(sessionClient);
final user = await account.get();`
	}
};

/**
 * Get SSR auth examples for a specific language
 * @param {string} language - The language/SDK name
 * @returns {Object} SSR auth code examples
 */
export function getSSRAuthExamples(language) {
	const languageMap = {
		javascript: 'javascript',
		nodejs: 'javascript',
		'react-native': 'javascript',
		python: 'python',
		php: 'php',
		go: 'go',
		ruby: 'ruby',
		dotnet: 'dotnet',
		swift: 'swift',
		kotlin: 'kotlin',
		dart: 'dart',
		flutter: 'dart'
	};

	const key = languageMap[language] || 'javascript';
	return ssrAuthExamples[key] || ssrAuthExamples.javascript;
}

/**
 * Get full SSR auth pattern with language-specific examples
 * @param {string} language - The language/SDK name
 * @returns {string} Complete SSR auth pattern with examples
 */
export function getSSRAuthPattern(language = 'javascript') {
	const examples = getSSRAuthExamples(language);

	return `${ssrAuthPatternExplanation}

**Creating Sessions:**
\`\`\`${language === 'javascript' || language === 'nodejs' ? 'javascript' : language}
${examples.createSession}
\`\`\`

**Making Authenticated Requests:**
\`\`\`${language === 'javascript' || language === 'nodejs' ? 'javascript' : language}
${examples.useSession}
\`\`\`

**OAuth2 Flow:**
1. Redirect to OAuth provider using createOAuth2Token
2. Handle callback with userId and secret parameters
3. Call createSession to exchange for session object
4. Store session secret in cookie`;
}

/**
 * SSR Authentication pattern for Node.js/JavaScript SSR frameworks
 * @deprecated Use getSSRAuthPattern('javascript') instead
 */
export const ssrAuthPattern = getSSRAuthPattern('javascript');

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
