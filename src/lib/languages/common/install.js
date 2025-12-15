/**
 * Common installation instructions by package manager/language
 */

export const npmInstall = `npm install appwrite`;

/**
 * JavaScript/TypeScript installation section
 * @param {string} [packageName] - Package name (default: 'appwrite')
 * @param {string} [title] - Installation title (default: 'Install the Appwrite JavaScript SDK')
 */
export function jsInstall(packageName = 'appwrite', title = 'Install the Appwrite JavaScript SDK') {
	return `## SDK Installation

${title} using npm:

\`\`\`bash
npm install ${packageName}
\`\`\`

You can also use yarn, pnpm, or bun instead.`;
}

/**
 * Default JavaScript installation (export as constant for backwards compatibility)
 */
export const jsInstallDefault = jsInstall();

/**
 * Node.js Server SDK installation section for SSR frameworks
 */
export const nodeAppwriteInstall = jsInstall('node-appwrite', 'Install the Appwrite Node.js Server SDK');

/**
 * Python installation section
 */
export const pythonInstall = `## SDK Installation

Install the Appwrite Python SDK using pip:

\`\`\`bash
pip install appwrite
\`\`\`

Or using poetry:

\`\`\`bash
poetry add appwrite
\`\`\``;

/**
 * PHP installation section
 */
export const phpInstall = `## SDK Installation

Install the Appwrite PHP SDK using Composer:

\`\`\`bash
composer require appwrite/appwrite
\`\`\``;

/**
 * Go installation section
 */
export const goInstall = `## SDK Installation

Install the Appwrite Go SDK:

\`\`\`bash
go get github.com/appwrite/sdk-for-go
\`\`\``;

/**
 * Ruby installation section
 */
export const rubyInstall = `## SDK Installation

Install the Appwrite Ruby SDK using Bundler:

\`\`\`bash
gem install appwrite
\`\`\`

Or add to your \`Gemfile\`:

\`\`\`ruby
gem 'appwrite'
\`\`\``;

/**
 * .NET installation section
 */
export const dotnetInstall = `## SDK Installation

Install the Appwrite .NET SDK using NuGet:

\`\`\`bash
dotnet add package Appwrite
\`\`\`

Or using Package Manager:

\`\`\`powershell
Install-Package Appwrite
\`\`\``;

/**
 * Dart/Flutter installation section (async - requires version lookup)
 * @param {string} version - SDK version
 * @param {boolean} isServer - Whether this is for server SDK
 */
export const dartInstall = (version, isServer = false) => {
	const sdkName = isServer ? 'Dart Server SDK' : 'Flutter SDK';
	const pubCommand = isServer ? 'dart pub get' : 'flutter pub get';
	const packageName = isServer ? 'dart_appwrite' : 'appwrite';
	
	return `## SDK Installation

Add the Appwrite ${sdkName} to your \`pubspec.yaml\`:

\`\`\`yaml
dependencies:
  ${packageName}: ^${version}
\`\`\`

Then install it:

\`\`\`bash
${pubCommand}
\`\`\``;
};

