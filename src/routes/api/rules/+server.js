import { generateRules, SDK_OPTIONS } from '$lib/rules-generator.js';
import { json, text } from '@sveltejs/kit';

// All available features
const ALL_FEATURES = ['auth', 'database', 'storage', 'functions', 'messaging', 'sites', 'realtime'];

/**
 * Normalize features array - replace 'all' with all available features
 * @param {string[]} features
 * @returns {string[]}
 */
function normalizeFeatures(features) {
	if (features.includes('all')) {
		return ALL_FEATURES;
	}
	return features;
}

/**
 * @param {{ url: URL }} event
 */
export async function GET({ url }) {
	try {
		const sdk = url.searchParams.get('sdk') || 'javascript';
		const framework = url.searchParams.get('framework') || 'nextjs';
		const featuresParam = url.searchParams.get('features');
		const format = url.searchParams.get('format') || 'text'; // 'text' or 'json'

		// Validate SDK
		if (!SDK_OPTIONS[sdk]) {
			return json(
				{ error: `Invalid SDK: ${sdk}. Available SDKs: ${Object.keys(SDK_OPTIONS).join(', ')}` },
				{ status: 400 }
			);
		}

		// Validate framework
		const sdkInfo = SDK_OPTIONS[sdk];
		if (!sdkInfo.frameworks.includes(framework)) {
			return json(
				{
					error: `Invalid framework: ${framework} for SDK: ${sdk}. Available frameworks: ${sdkInfo.frameworks.join(', ')}`
				},
				{ status: 400 }
			);
		}

		// Parse and normalize features
		const features = normalizeFeatures(
			featuresParam ? featuresParam.split(',').filter(Boolean) : ['auth']
		);

		// Generate rules
		const rules = await generateRules({
			sdk,
			framework,
			features
		});

		// Return based on format
		if (format === 'json') {
			return json({
				sdk,
				framework,
				features,
				rules
			});
		}

		return text(rules, {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				'Content-Disposition': 'attachment; filename="AGENTS.md"'
			}
		});
	} catch (error) {
		console.error('Error generating rules:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to generate rules';
		return json({ error: errorMessage }, { status: 500 });
	}
}
