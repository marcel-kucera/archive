<div id="header">
	<a id="headerText" href="/#">
		<h1>K-Upload</h1>
	</a>
	<div class="spacer" />
	<a class="link" href="/login">
		<span>Login</span>
	</a>
</div>

<div id="main">
	<div id="inner">
		<slot />
	</div>
</div>

<style lang="scss">
	:global(body) {
		color: white;
		background-color: black;
		margin: 0;
		font-family: sans-serif;
	}

	#header {
		padding: 1rem;
		display: flex;
	}
	#headerText {
		h1 {
			margin: 0;
		}
		color: white;
		text-decoration: none;
	}
	.spacer {
		flex: 1;
	}

	.link {
		color: white;
		text-decoration: none;
		border: 1px solid white;
		font-size: large;
		display: flex;
		padding: auto;
		span {
			margin: auto;
		}
	}

	#main {
		display: flex;
	}
	#inner {
		padding: 5rem;
		border: 1px solid white;
		margin: auto;
	}
</style>
