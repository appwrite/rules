import { generateRules } from '../src/lib/rules-generator.js';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateNextJSRules() {
	try {
		console.log('Generating Next.js rules with all products enabled...');
		
		const rules = await generateRules({
			sdk: 'javascript',
			framework: 'nextjs',
			features: ['auth', 'database', 'storage', 'functions', 'messaging', 'sites', 'realtime']
		});
		
		const outputPath = join(__dirname, '..', 'AGENTS.md');
		await writeFile(outputPath, rules, 'utf-8');
		
		console.log(`Rules generated successfully!`);
		console.log(`Output file: ${outputPath}`);
	} catch (error) {
		console.error('Error generating rules:', error);
		process.exit(1);
	}
}

generateNextJSRules();

