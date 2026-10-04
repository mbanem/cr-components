<script>
	let caption = $state('Database Parameters');

	const captions = [
		'Database Parameters',
		'Role already exists',
		'Cannot drop role',
		'Objects still depend on role',
		'Connection terminated'
	];
	// let crimson='crimson'

	function nextCaption() {
		const currentIndex = captions.indexOf(caption);
		caption = captions[(currentIndex + 1) % captions.length];
	}
</script>

<div class="demo">
	<div
		class="wrapper"
		class:caption={`${caption[0] === 'C'}`}
		style:--caption={`"${caption}"`}
		style:--crimson={`${caption[0] === 'C' ? 'crimson' : '#4b5563'}`}
	>
		<p>This is the content inside the box.</p>
		<p>The caption above is controlled by a CSS variable.</p>
		<p style="color:blue;">When caption begins with C colors turn red.</p>
	</div>

	<div class="controls">
		<button onclick={nextCaption}> Change Caption </button>

		<button onclick={() => (caption = 'Custom message!')}> Set Custom </button>
	</div>

	<p class="current">Current caption: <strong>{caption}</strong></p>
</div>

<style>
	.demo {
		font-family: system-ui, sans-serif;
		max-width: 420px;
		margin: 2rem auto;
		padding: 1rem;
	}

	.wrapper {
		position: relative;
		border: 2px solid #4b5563;
		border-radius: 8px;
		padding: 1.5rem 1.25rem 1.25rem;
		margin-top: 1.5rem;
		background: #f8fafc;
		color: #1e293b;
	}

	/* The magic */
	.wrapper::before {
		content: var(--caption);
		position: absolute;
		top: -0.75em;
		left: 1.1rem;
		padding: 0 0.5rem;
		background: #f8fafc;
		color: var(--crimson, #0f172a);
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}
	.wrapper.caption {
		border-color: var(--crimson);
	}
	.controls {
		margin-top: 1.5rem;
		display: flex;
		gap: 0.75rem;
	}

	button {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #94a3b8;
		background: white;
		cursor: pointer;
		font-size: 0.9rem;
	}

	button:hover {
		background: #f1f5f9;
	}

	.current {
		margin-top: 1.25rem;
		font-size: 0.95rem;
		color: #475569;
	}
</style>
