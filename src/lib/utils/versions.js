/**
 * Fetches the latest SDK versions from Appwrite's versions API
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchSDKVersions() {
	try {
		const response = await fetch('https://cloud.appwrite.io/versions');
		if (!response.ok) {
			throw new Error(`Failed to fetch versions: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching SDK versions:', error);
		// Return fallback versions if API is unavailable
		return {
			'server-kotlin': '13.0.0',
			'client-flutter': '20.3.2',
			'client-apple': '13.4.0',
			'client-android': '11.3.0',
			'client-react-native': '0.18.0',
			'server-nodejs': '26.0.0',
			'server-php': '20.0.0',
			'server-python': '15.0.0',
			'server-ruby': '19.4.0',
			'server-go': 'v0.15.0',
			'server-dotnet': '0.23.0',
			'server-dart': '20.0.1',
			'server-swift': '14.0.0',
			'client-web': '21.4.0'
		};
	}
}

/**
 * Gets the version for a specific SDK
 * @param {string} sdkKey - The SDK key (e.g., 'server-kotlin', 'client-flutter')
 * @returns {Promise<string>}
 */
export async function getSDKVersion(sdkKey) {
	const versions = await fetchSDKVersions();
	return versions[sdkKey] || 'latest';
}

/**
 * Version cache to avoid multiple API calls
 * @type {Record<string, string> | null}
 */
let versionCache = null;

/**
 * Gets cached or fetches SDK versions
 * @returns {Promise<Record<string, string>>}
 */
export async function getCachedVersions() {
	if (versionCache) {
		return versionCache;
	}
	versionCache = await fetchSDKVersions();
	return versionCache;
}
