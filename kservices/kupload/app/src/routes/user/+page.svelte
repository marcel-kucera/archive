<script lang="ts">
	import { getUserData } from '$lib/login';

	let userdata = getUserData();
</script>

<h1>User</h1>
{#await userdata}
	<p>Loading...</p>
{:then res}
	<p>{JSON.stringify(res.data)}</p>
{:catch err}
	<p>there was an error: {err.response.data}</p>
{/await}
