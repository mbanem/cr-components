<script lang="ts">
	function closeTheApp() {
		console.log('close the app');
	}
</script>

<div class="config-warning-container">
	The <code>schema.prisma</code> or <span>CONNECTION_URL</span> is invalid. To move to the next step
	update the files and saved them to be verified by extension before proceeding.

	<hr />

	<pre>Your can choose to</pre>
	<ul>
		<li>
			Update your files and save them. The extension will automatically detect the changes and
			advance to the next step if they are valid.
		</li>
		<li>
			Close the extension, install Prisma ORM manually and restart it to take the next step if files
			are valid.
		</li>
	</ul>
	<div class="button">
		<button onclick={closeTheApp}>close</button>
	</div>
</div>

<style lang="scss">
	.config-warning-container {
		@include container($caption: 'Configuration Required');
		max-width: 25.5em;
		padding: 1rem;
		margin-top: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		line-height: 1.2;
		span {
			font-size: 11px;
			font-variant: small-caps;
			font-weight: 600;
		}
	}

	code {
		font-family: monospace;
		font-size: 15px;
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.15rem 0.3rem;
		border-radius: 3px;
	}

	ul {
		padding-left: 1.5rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	hr {
		border: 0;
		border-top: 1px solid #ccc;
		margin: 1.5rem 0;
	}
	.button {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		width: 100%;
		margin-left: auto;
		margin-right: 1rem;
		button {
			width: 5rem;
		}
	}
</style>
