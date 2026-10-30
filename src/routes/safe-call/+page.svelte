<script lang="ts">
	import { safeCall, getUserName, getUser } from './utils';
	import type { GetUserParams } from './utils';

	// let userName = $state<string | null>(null); // null, not an empty strung
	// let errorMsg = $state<string | null>(null);
	let answer = $state<{ userName: string | null; error: string | null }>({
		userName: null,
		error: null
	});
	let isLoading = $state<boolean>(false);
	function resetResult() {
		answer = { userName: null, error: null };
	}
	// type TUserParams = { id: number; includeAvatar: boolean };
	async function fetchUser(id: number) {
		isLoading = true;
		// userName = null;
		// errorMsg = null;
		resetResult();
		// ✅ Case 1: WITH an argument (a single object)
		const params: GetUserParams = { id, includeAvatar: true };
		// TypeScript knows 'params' is GetUserParams inside getUser
		// let params: { id: number; includeAvatar: true } = { id, includeAvatar: true };
		const result = await safeCall(getUser, params);

		if (result.error) {
			answer.error = result.error.message;
		} else {
			answer.userName = result.data;
		}

		isLoading = false;
	}

	async function fetchName() {
		// 1. Reset state before starting
		isLoading = true;

		resetResult();
		// 2. Execute the safe call
		const result = await safeCall(getUserName);

		// 3. Update state based on result
		if (result.error) {
			answer.error = result.error.message;
		} else {
			answer.userName = result.data;
		}

		// 4. Clean up loading state
		isLoading = false;
	}
</script>

<main>
	<h1>safeCall with Optional Argument</h1>

	<button onclick={() => fetchUser(42)} disabled={isLoading}> Load User #42 (with arg) </button>

	<button onclick={fetchName} disabled={isLoading}> Load Name (no arg) </button>

	{#if isLoading}
		<p class="loading">⏳ Loading...</p>
	{:else if answer.userName}
		<p class="success">✅ {answer.userName}</p>
	{:else if answer.error}
		<p class="error">❌ {answer.error}</p>
	{/if}
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
		text-align: center;
		padding: 2rem;
	}
	button {
		padding: 0.6rem 1.2rem;
		margin: 0.3rem;
		font-size: 1rem;
		cursor: pointer;
		background: #ff3e00;
		color: white;
		border: none;
		border-radius: 6px;
	}
	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
	.loading {
		color: #666;
		font-style: italic;
	}
	.success {
		color: #16a34a;
		font-size: 1.2rem;
		margin-top: 1.5rem;
	}
	.error {
		color: #dc2626;
		margin-top: 1.5rem;
		background: #fee2e2;
		padding: 1rem;
		border-radius: 6px;
	}
</style>
