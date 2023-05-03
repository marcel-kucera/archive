<script lang="ts">
	import { upload } from '$lib/upload';
	import { axiosErrorText } from '$lib/util';
	import type { AxiosResponse } from 'axios';

	let files: FileList;
	let formError: String;

	let uploadPromise: Promise<AxiosResponse> | null;
	let progress: number = 0;
	let abortController = new AbortController();

	async function handle() {
		if (!files || files.length == 0) {
			formError = 'you have to select a file';
			return;
		}
		if (files.length > 1) {
			formError = 'you can only select one file';
			return;
		}

		abortController = new AbortController();
		window.location.hash = 'upload';
		uploadPromise = upload(
			files[0],
			(e: ProgressEvent) => (progress = Math.floor((e.loaded / e.total) * 100)),
			abortController.signal
		);
	}

	function hashChange(e: HashChangeEvent) {
		let split = e.newURL.split('#');
		let hash = split[1] ? split[1] : '';
		if (hash == '') {
			abortController.abort();
			uploadPromise = null;
			progress = 0;
		}
	}
</script>

<svelte:window on:hashchange={hashChange} />

{#if !uploadPromise}
	<form on:submit|preventDefault={handle} class="container">
		<h1>Upload a File</h1>
		<input type="file" bind:files />
		<button type="submit">submit</button>
		{#if formError}
			<span class="error">{formError}</span>
		{/if}
	</form>
{:else}
	<div class="container">
		{#await uploadPromise}
			<h1>Uploading</h1>
			<progress value={progress} max="100" />
			<span class="center">{progress}%</span>
		{:then res}
			<h1>File Uploaded!</h1>
			<span>{res.data}</span>
		{:catch err}
			<span class="error">{axiosErrorText(err)}</span>
		{/await}
	</div>
{/if}

<style lang="scss">
	h1 {
		margin: 0;
	}
	.center {
		text-align: center;
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.error {
		color: red;
	}
</style>
