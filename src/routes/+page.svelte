<script>
	import { SDK_OPTIONS, generateRules } from '$lib/rules-generator';
	
	let selectedSDK = 'javascript';
	let selectedFramework = 'nextjs';
	let selectedFeatures = ['auth'];
	let generatedRules = '';
	let previewVisible = false;
	let copyButtonText = 'Copy';
	
	const features = [
		{ id: 'auth', label: 'Auth' },
		{ id: 'database', label: 'Database' },
		{ id: 'storage', label: 'Storage' },
		{ id: 'functions', label: 'Functions' },
		{ id: 'messaging', label: 'Messaging' },
		{ id: 'sites', label: 'Sites' },
		{ id: 'realtime', label: 'Realtime' },
		{ id: 'mcp', label: 'MCP' }
	];
	
	function updateFrameworks() {
		const sdk = SDK_OPTIONS[selectedSDK];
		if (sdk && sdk.frameworks.length > 0) {
			selectedFramework = sdk.frameworks[0];
		}
	}
	
	async function generate() {
		generatedRules = await generateRules({
			sdk: selectedSDK,
			framework: selectedFramework,
			features: selectedFeatures
		});
		previewVisible = true;
	}
	
	function downloadRules() {
		const blob = new Blob([generatedRules], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `APPWRITE-${selectedSDK}-${selectedFramework}.mdc`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function copyRules() {
		try {
			await navigator.clipboard.writeText(generatedRules);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			copyButtonText = 'Copy Failed';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		}
	}
	
	/** @param {string} featureId */
	function toggleFeature(featureId) {
		if (selectedFeatures.includes(featureId)) {
			selectedFeatures = selectedFeatures.filter(f => f !== featureId);
		} else {
			selectedFeatures = [...selectedFeatures, featureId];
		}
	}
</script>

<svelte:head>
	<title>Appwrite Rules Generator</title>
</svelte:head>

<div class="main-layout">
	<aside class="sidebar">
		<div class="form-content">
			<div class="form-section">
				<label class="label" for="sdk-select">Select SDK:</label>
				<select class="input-field" id="sdk-select" bind:value={selectedSDK} on:change={updateFrameworks}>
					{#each Object.entries(SDK_OPTIONS) as [key, value]}
						<option value={key}>{value.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-section">
				<label class="label" for="framework-select">Select Framework:</label>
				<select class="input-field" id="framework-select" bind:value={selectedFramework}>
					{#each SDK_OPTIONS[selectedSDK]?.frameworks || [] as framework}
						<option value={framework}>{framework.charAt(0).toUpperCase() + framework.slice(1)}</option>
					{/each}
				</select>
			</div>

			<div class="form-section">
				<p class="label">Select Features:</p>
				<div class="features-list">
					{#each features as feature}
						<label class="checkbox">
							<input
								type="checkbox"
								checked={selectedFeatures.includes(feature.id)}
								on:change={() => toggleFeature(feature.id)}
							/>
							<span>{feature.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<button class="button is-primary" on:click={generate}>
				Generate Rules
			</button>
		</div>
	</aside>

	<main class="content-area">
		{#if previewVisible && generatedRules}
			<div class="card">
				<div class="preview-header">
					<h2>Generated Rules</h2>
					<div class="button-group">
						<button class="button is-secondary" on:click={copyRules}>
							{copyButtonText}
						</button>
						<button class="button is-secondary" on:click={downloadRules}>
							Download .mdc
						</button>
					</div>
				</div>
				<div class="code-panel">
					<pre><code>{generatedRules}</code></pre>
				</div>
			</div>
		{:else}
			<div class="card">
				<div class="empty-state">
					<p>Select your options and click "Generate Rules" to see the output here.</p>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(*) {
		-webkit-tap-highlight-color: transparent;
	}

	.main-layout {
		display: flex;
		width: 100%;
		min-height: 100vh;
		padding: 0;
		box-sizing: border-box;
		gap: 0;
		align-items: stretch;
	}

	.sidebar {
		flex: 0 0 320px;
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding: 1.5rem;
		background-color: hsl(var(--color-neutral-100));
		border-right: solid .0625rem hsl(var(--color-border));
		box-sizing: border-box;
	}

	.form-content {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 1.5rem;
	}

	.form-section {
		margin-bottom: 2rem;
	}

	.form-section:last-of-type {
		margin-bottom: 0;
	}

	.label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.input-field {
		width: 100%;
		min-height: 44px;
		font-size: 1rem;
		padding: 0.5rem 0.75rem;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		min-height: 44px;
		padding: 0.5rem 0;
	}

	.checkbox input[type="checkbox"] {
		width: 20px;
		height: 20px;
		min-width: 20px;
		cursor: pointer;
	}

	.button {
		width: 100%;
		margin-top: 1.5rem;
		flex-shrink: 0;
		min-height: 44px;
	}

	.content-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		padding: 5rem;
		max-height: 100vh;
		min-height: 100vh;
		box-sizing: border-box;
		overflow: hidden;
	}

	.content-area .card {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-shrink: 0;
	}

	.preview-header h2 {
		margin: 0;
	}

	.preview-header .button-group {
		display: flex;
		gap: 0.75rem;
	}

	.preview-header .button {
		width: auto;
		margin-top: 0;
	}

	.code-panel {
		flex: 1;
		overflow-y: auto;
		overflow-x: auto;
		min-height: 0;
		-webkit-overflow-scrolling: touch;
	}

	.code-panel pre {
		margin: 0;
		overflow-x: auto;
		min-width: fit-content;
	}

	.code-panel code {
		padding: 1rem;
		display: block;
		white-space: pre;
		word-wrap: normal;
		overflow-wrap: normal;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Tablet and below */
	@media (max-width: 968px) {
		.main-layout {
			flex-direction: column;
			min-height: auto;
			padding: 1rem;
		}

		.sidebar {
			flex: 1;
			width: 100%;
			height: auto;
			min-height: auto;
			border-right: none;
			border-bottom: solid .0625rem hsl(var(--color-border));
			padding: 1.25rem;
		}

		.content-area {
			width: 100%;
			max-height: none;
			min-height: auto;
			overflow: visible;
			padding: 1.5rem;
		}

		.code-panel {
			max-height: 600px;
		}

		.empty-state {
			padding: 2rem 1rem;
		}
	}

	/* Mobile devices */
	@media (max-width: 768px) {
		.main-layout {
			padding: 0.75rem;
		}

		.sidebar {
			padding: 1rem;
		}

		.form-section {
			margin-bottom: 1.5rem;
		}

		.content-area {
			padding: 1rem;
		}

		.preview-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.preview-header h2 {
			font-size: 1.5rem;
		}

		.preview-header .button-group {
			flex-direction: column;
			gap: 0.5rem;
		}

		.preview-header .button {
			width: 100%;
			min-height: 44px;
		}

		.code-panel {
			max-height: 400px;
		}

		.code-panel code {
			padding: 0.75rem;
			font-size: 0.8125rem;
		}

		.empty-state {
			padding: 1.5rem 0.75rem;
		}

		.empty-state p {
			font-size: 0.9375rem;
		}
	}

	/* Small mobile devices */
	@media (max-width: 480px) {
		.main-layout {
			padding: 0.5rem;
		}

		.sidebar {
			padding: 0.875rem;
		}

		.content-area {
			padding: 0.75rem;
		}

		.preview-header h2 {
			font-size: 1.25rem;
		}

		.code-panel {
			max-height: 350px;
		}

		.code-panel code {
			padding: 0.5rem;
			font-size: 0.75rem;
		}

		.empty-state {
			padding: 1rem 0.5rem;
		}
	}

	/* Very small screens - landscape mobile */
	@media (max-width: 640px) and (orientation: landscape) {
		.code-panel {
			max-height: 250px;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.button {
			min-height: 48px;
		}

		.input-field {
			min-height: 48px;
		}

		.checkbox {
			min-height: 48px;
		}
	}
</style>


