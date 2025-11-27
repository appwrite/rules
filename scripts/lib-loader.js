// Custom Node.js loader to resolve $lib aliases
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolvePath(__dirname, '..');

export async function resolve(specifier, context, nextResolve) {
	if (specifier.startsWith('$lib/')) {
		const relativePath = specifier.replace('$lib/', '');
		const absolutePath = resolvePath(projectRoot, 'src', 'lib', relativePath);
		const fileUrl = pathToFileURL(absolutePath).href;
		return {
			url: fileUrl,
			format: 'module',
			shortCircuit: true
		};
	}
	return nextResolve(specifier, context);
}

