# Appwrite AGENTS.md Generator

A web application for generating comprehensive AGENTS.md files for Appwrite development across multiple SDKs and frameworks. This tool helps developers create customized AI coding assistant instructions that include best practices, code examples, and guidance for building applications with Appwrite.

## Features

- **Multi-SDK Support**: Generate rules for JavaScript/TypeScript, Python, PHP, Go, Flutter/Dart, Apple, Android, Swift, Kotlin, Ruby, .NET, and React Native
- **Framework-Specific Rules**: Get tailored rules for popular frameworks like Next.js, React, Vue, Svelte, Angular, Astro, Nuxt, Qwik, Solid, and more
- **Feature Selection**: Choose which Appwrite features to include:
  - Authentication & Teams
  - Database Operations
  - Storage Operations
  - Functions
  - Messaging
  - Sites
  - Realtime Subscriptions
- **Export Options**: Copy to clipboard or download as `AGENTS.md` file
- **Best Practices**: Generated rules include comprehensive best practices, multi-tenancy patterns, and security guidelines

## Supported SDKs and Frameworks

| SDK                   | Frameworks                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------ |
| JavaScript/TypeScript | Next.js, React, Vue, Svelte, Angular, Astro, Nuxt, Qwik, Solid, TanStack, Node.js, Vanilla |
| React Native          | React Native, Vanilla                                                                      |
| Python                | Flask, Django, FastAPI, Server                                                             |
| Flutter/Dart          | Flutter, Server                                                                            |
| Apple                 | Vanilla                                                                                    |
| Android               | Vanilla                                                                                    |
| Swift                 | Server, Vanilla                                                                            |
| Kotlin                | Server, Vanilla                                                                            |
| PHP                   | Laravel, Symfony, Server                                                                   |
| Go                    | Gin, Fiber, Server                                                                         |
| Ruby                  | Rails, Server                                                                              |
| .NET                  | ASP.NET, Server, Vanilla                                                                   |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd appwrite-cursor-rules
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## Usage

1. **Select SDK**: Choose your preferred Appwrite SDK from the dropdown
2. **Select Framework**: Pick the framework you're using (options depend on the selected SDK)
3. **Choose Features**: Check the boxes for the Appwrite features you want to include in your rules
4. **Generate Rules**: Click the "Generate Rules" button
5. **Export**: Copy the rules to your clipboard or download as a `AGENTS.md` file

The generated AGENTS.md file can be used with AI coding assistants (Cursor, GitHub Copilot, OpenAI Codex, etc.) to provide AI-assisted development guidance specific to your Appwrite setup.

## API Endpoints

The application exposes REST API endpoints for programmatic access to rule generation.

### Get Available SDKs and Frameworks

**GET** `/api/sdks`

Returns a list of all available SDKs, their frameworks, and available features.

**Response:**

```json
{
  "sdks": [
    {
      "id": "javascript",
      "name": "JavaScript/TypeScript",
      "frameworks": ["nextjs", "react", "vue", ...],
      "importSyntax": "import",
      "exportSyntax": "export",
      "asyncSyntax": "async/await"
    },
    ...
  ],
  "availableFeatures": ["auth", "database", "storage", "functions", "messaging", "sites", "realtime"]
}
```

### Generate Rules

**GET** `/api/rules`

Generate rules using query parameters.

**Query Parameters:**

- `sdk` (required): SDK identifier (e.g., `javascript`, `python`, `go`)
- `framework` (required): Framework identifier (e.g., `nextjs`, `react`, `flask`)
- `features` (optional): Comma-separated list of features (default: `auth`)
  - Available: `auth`, `database`, `storage`, `functions`, `messaging`, `sites`, `realtime`
  - Special: `all` - includes all available features
- `format` (optional): Response format (`text` or `json`, default: `text`)

**Example:**

```bash
# Get rules as markdown text
curl "http://localhost:5173/api/rules?sdk=javascript&framework=nextjs&features=auth,database&format=text"

# Get all features
curl "http://localhost:5173/api/rules?sdk=javascript&framework=nextjs&features=all"

# Get rules as JSON
curl "http://localhost:5173/api/rules?sdk=python&framework=flask&features=auth,storage&format=json"
```

**Response (format=text):**

- Content-Type: `text/markdown; charset=utf-8`
- Returns the generated rules as markdown text
- Includes `Content-Disposition` header for file download

**Response (format=json):**

```json
{
	"sdk": "javascript",
	"framework": "nextjs",
	"features": ["auth", "database"],
	"rules": "# Appwrite Development Rules\n\n> You are an expert developer...\n\n## Overview\n..."
}
```

**Error Responses:**

- `400 Bad Request`: Invalid SDK or framework
- `500 Internal Server Error`: Server error during rule generation

**Example Usage:**

```javascript
// Fetch rules using fetch API
const response = await fetch('/api/rules?sdk=javascript&framework=nextjs&features=auth,database');
const rules = await response.text();

// Get all features as JSON
const response = await fetch('/api/rules?sdk=javascript&framework=nextjs&features=all&format=json');
const data = await response.json();
console.log(data.rules);
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Svelte type checking
- `pnpm lint` - Run ESLint and Prettier
- `pnpm format` - Format code with Prettier
- `pnpm generate:nextjs` - Generate Next.js rules file (example script)

### Project Structure

```
appwrite-cursor-rules/
├── src/
│   ├── lib/
│   │   ├── languages/          # SDK and framework-specific code examples
│   │   │   ├── js/             # JavaScript/TypeScript frameworks
│   │   │   ├── python/         # Python frameworks
│   │   │   ├── common/         # Shared rules (products, permissions, etc.)
│   │   │   └── ...             # Other SDKs
│   │   ├── rules-generator.js  # Main rules generation logic
│   │   └── utils/              # Utility functions
│   └── routes/
│       ├── api/
│       │   ├── rules/
│       │   │   └── +server.js   # API endpoint for generating rules
│       │   └── sdks/
│       │       └── +server.js   # API endpoint for listing SDKs
│       ├── +page.svelte        # Main application page
│       └── +layout.svelte      # Layout component
├── scripts/
│   ├── generate-nextjs-rules.js  # Example script for generating rules
│   └── lib-loader.js             # Module loader for scripts
└── static/                        # Static assets
```

### Adding New SDKs or Frameworks

1. Create a new file in `src/lib/languages/[sdk-name]/index.js` (or add to existing SDK directory)
2. Export framework-specific initialization code
3. Add the SDK configuration to `SDK_OPTIONS` in `src/lib/rules-generator.js`
4. Export the SDK module in `src/lib/languages/index.js`

### Adding New Features

1. Create a new section generator function in `src/lib/rules-generator.js` (e.g., `generateNewFeatureSection`)
2. Add the feature to the features array in `src/routes/+page.svelte`
3. Include the feature in the `generateRules` function's Promise.all array

## Generated AGENTS.md Format

The generated AGENTS.md file follows the [AGENTS.md standard](https://agents.md/) and includes:

- **Title and Description**: Project context and overview for AI coding assistants
- **SDK Initialization**: Framework-specific code examples for setting up Appwrite
- **Feature Sections**: Best practices and guidance for selected features
- **Multi-Tenancy Guide**: Comprehensive guide on using teams and permissions
- **Product Links**: Links to official Appwrite documentation

The AGENTS.md format is compatible with multiple AI coding assistants including Cursor, GitHub Copilot, OpenAI Codex, and others.
