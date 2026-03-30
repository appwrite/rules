<script>
	import { SDK_OPTIONS, generateRules } from '$lib/rules-generator';
	import {
		Input,
		Selector,
		Button,
		Typography,
		Card,
		Layout,
		Code,
		Empty
	} from '@appwrite.io/pink-svelte';
	import appwriteLogo from '$lib/assets/appwrite.svg';

	let selectedSDK = 'javascript';
	let selectedFramework = 'nextjs';
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
		{ id: 'realtime', label: 'Realtime' }
	];

	/** @type {Record<string, boolean>} */
	let featureChecked = {
		auth: true,
		database: false,
		storage: false,
		functions: false,
		messaging: false,
		sites: false,
		realtime: false
	};
	$: selectedFeatures = features.filter((f) => featureChecked[f.id]).map((f) => f.id);

	const sdkOptions = Object.entries(SDK_OPTIONS).map(([key, sdk]) => ({
		label: sdk.name,
		value: key
	}));

	$: frameworkOptions = (SDK_OPTIONS[selectedSDK]?.frameworks || []).map((f) => ({
		label: f.charAt(0).toUpperCase() + f.slice(1),
		value: f
	}));

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
		a.download = 'AGENTS.md';
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
</script>

<svelte:head>
	<title>Appwrite AGENTS.md Generator</title>
</svelte:head>

<div class="main-layout">
	<aside class="sidebar">
		<Layout.Stack gap="xl">
			<Layout.Stack direction="row" alignItems="center" gap="l">
				<img src={appwriteLogo} alt="Appwrite" class="logo" />
				<Typography.Title size="s">AGENTS.md Generator</Typography.Title>
			</Layout.Stack>

			<Layout.Stack gap="l">
				<Input.Select
					label="SDK"
					required={true}
					options={sdkOptions}
					bind:value={selectedSDK}
					on:change={updateFrameworks}
				/>

				<Input.Select
					label="Framework"
					required={true}
					options={frameworkOptions}
					bind:value={selectedFramework}
				/>
			</Layout.Stack>

			<Layout.Stack gap="s">
				<Typography.Text variant="m-500">Features</Typography.Text>
				{#each features as feature}
					<Selector.Checkbox
						id={feature.id}
						size="s"
						label={feature.label}
						bind:checked={featureChecked[feature.id]}
					/>
				{/each}
			</Layout.Stack>

			<Button.Button variant="primary" size="s" on:click={generate}
				>Generate AGENTS.md</Button.Button
			>
		</Layout.Stack>
	</aside>

	<main class="content-area">
		{#if previewVisible && generatedRules}
			<Card.Base padding="s">
				<Layout.Stack gap="l">
					<div class="preview-header">
						<Typography.Title size="s">Generated AGENTS.md</Typography.Title>
						<div class="button-group">
							<Button.Button variant="secondary" size="s" on:click={copyRules}>
								{copyButtonText}
							</Button.Button>
							<Button.Button variant="secondary" size="s" on:click={downloadRules}>
								Download AGENTS.md
							</Button.Button>
						</div>
					</div>
					<div class="code-panel">
						<Code code={generatedRules} lang="md" hideHeader={true} lineNumbers={false} />
					</div>
				</Layout.Stack>
			</Card.Base>
		{:else}
			<Card.Base padding="l">
				<Empty
					title="No AGENTS.md Generated"
					description="Select your options and click &quot;Generate AGENTS.md&quot; to see the output here."
				/>
			</Card.Base>
		{/if}
	</main>
</div>

<style>
	:global(*) {
		-webkit-tap-highlight-color: transparent;
	}

	.logo {
		height: var(--icon-size-l);
		width: auto;
	}

	.main-layout {
		display: flex;
		width: 100%;
		min-height: 100vh;
	}

	.sidebar {
		flex: 0 0 300px;
		height: 100vh;
		padding: var(--space-9);
		background-color: var(--bgcolor-neutral-default);
		border-right: var(--border-width-s) solid var(--border-neutral);
		box-sizing: border-box;
		overflow-y: auto;
	}

	.content-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		padding: var(--space-10);
		max-height: 100vh;
		min-height: 100vh;
		box-sizing: border-box;
		overflow: hidden;
	}

	.content-area > :global(*) {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.content-area > :global(*) > :global(*) {
		flex: 1;
		min-height: 0;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.button-group {
		display: flex;
		gap: var(--gap-s);
	}

	.code-panel {
		flex: 1;
		overflow-y: auto;
		overflow-x: auto;
		min-height: 0;
	}

	/* Tablet and below */
	@media (max-width: 968px) {
		.main-layout {
			flex-direction: column;
			min-height: auto;
		}

		.sidebar {
			flex: 1;
			width: 100%;
			height: auto;
			border-right: none;
			border-bottom: var(--border-width-s) solid var(--border-neutral);
			padding: var(--space-8);
		}

		.content-area {
			width: 100%;
			max-height: none;
			min-height: auto;
			overflow: visible;
			padding: var(--space-8);
		}

		.code-panel {
			max-height: 600px;
		}
	}

	/* Mobile devices */
	@media (max-width: 768px) {
		.sidebar {
			padding: var(--space-7);
		}

		.content-area {
			padding: var(--space-7);
		}

		.preview-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--gap-s);
		}

		.button-group {
			flex-direction: column;
			gap: var(--gap-xs);
		}

		.code-panel {
			max-height: 400px;
		}
	}

	/* Small mobile devices */
	@media (max-width: 480px) {
		.sidebar {
			padding: var(--space-6);
		}

		.content-area {
			padding: var(--space-6);
		}

		.code-panel {
			max-height: 350px;
		}
	}

	/* Landscape mobile */
	@media (max-width: 640px) and (orientation: landscape) {
		.code-panel {
			max-height: 250px;
		}
	}
</style>
