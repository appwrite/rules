import { SDK_OPTIONS } from '$lib/rules-generator.js';
import { json } from '@sveltejs/kit';

/**
 * @param {Request} request
 */
export async function GET() {
	try {
		const sdks = Object.entries(SDK_OPTIONS).map(([key, value]) => ({
			id: key,
			name: value.name,
			frameworks: value.frameworks,
			importSyntax: value.importSyntax,
			exportSyntax: value.exportSyntax,
			asyncSyntax: value.asyncSyntax
		}));

		return json({
			sdks,
			availableFeatures: [
				'auth',
				'database',
				'storage',
				'functions',
				'messaging',
				'sites',
				'realtime',
				'all'
			]
		});
	} catch (error) {
		console.error('Error fetching SDKs:', error);
		return json({ error: error.message || 'Failed to fetch SDKs' }, { status: 500 });
	}
}

