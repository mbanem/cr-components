<script lang="ts">
	let users = [];
	let errorMsg = '';

	async function loadUsers() {
		// One line instead of 5-6 lines of try/catch
		const { data, error } = await handleTryCatch(() => fetch('/api/users'));

		if (data) {
			users = await data.json();
		} else if (error) {
			errorMsg = error.message;
		}
	}
</script>
