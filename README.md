# Appwrite Cursor Rules Generator

A web application for generating comprehensive Cursor rules (`.mdc` files) for Appwrite development across multiple SDKs and frameworks. This tool helps developers create customized development rules that include best practices, code examples, and guidance for building applications with Appwrite.

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
  - MCP (Model Context Protocol) recommendations
- **Export Options**: Copy to clipboard or download as `.mdc` file
- **Best Practices**: Generated rules include comprehensive best practices, multi-tenancy patterns, and security guidelines

## Supported SDKs and Frameworks

| SDK | Frameworks |
|-----|------------|
| JavaScript/TypeScript | Next.js, React, Vue, Svelte, Angular, Astro, Nuxt, Qwik, Solid, TanStack, Node.js, Vanilla |
| React Native | React Native, Vanilla |
| Python | Flask, Django, FastAPI, Server |
| Flutter/Dart | Flutter, Server |
| Apple | Vanilla |
| Android | Vanilla |
| Swift | Server, Vanilla |
| Kotlin | Server, Vanilla |
| PHP | Laravel, Symfony, Server |
| Go | Gin, Fiber, Server |
| Ruby | Rails, Server |
| .NET | ASP.NET, Server, Vanilla |

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
5. **Export**: Copy the rules to your clipboard or download as a `.mdc` file

The generated rules file can be used in Cursor IDE to provide AI-assisted development guidance specific to your Appwrite setup.

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
│   │   │   ├── common/         # Shared rules (products, MCP, etc.)
│   │   │   └── ...             # Other SDKs
│   │   ├── rules-generator.js  # Main rules generation logic
│   │   └── utils/              # Utility functions
│   └── routes/
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

## Generated Rules Format

The generated rules follow the Cursor `.mdc` format and include:

- **Frontmatter**: Metadata about the rules (description, alwaysApply flag)
- **SDK Initialization**: Framework-specific code examples for setting up Appwrite
- **Feature Sections**: Best practices and guidance for selected features
- **Multi-Tenancy Guide**: Comprehensive guide on using teams and permissions
- **Product Links**: Links to official Appwrite documentation


