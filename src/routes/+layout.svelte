<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@appwrite.io/pink-legacy';
	import { Root } from '@appwrite.io/pink-svelte';
	import themeDark from '$lib/theme-dark.json';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/fonts/main.css" />
	<link rel="stylesheet" href="/fonts/cloud.css" />
</svelte:head>

<Root theme={themeDark}>
	{@render children()}
</Root>
