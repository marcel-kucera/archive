<script lang="ts">
	import { login } from '$lib/login';
	import { axiosErrorText } from '$lib/util';

	let name: string;
	let password: string;
	let disabled = false;
	let status = '';
	let error = false;

	async function handle() {
		disabled = true;
		try {
			await login(name, password);
			error = false;
			status = 'success';
		} catch (err) {
			error = true;
			status = axiosErrorText(err);
		}
		disabled = false;
	}
</script>

<h1>Login</h1>
<form on:submit|preventDefault={handle} class="container">
	<div>
		<input type="text" placeholder="Username" bind:value={name} /><br />
		<input type="password" placeholder="Password" bind:value={password} /><br />
	</div>
	<button type="submit" {disabled}>Login</button>
	<span class:error>{status}</span>
</form>

<style lang="scss">
	h1 {
		margin: 0;
	}
	.error {
		color: red;
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
</style>
