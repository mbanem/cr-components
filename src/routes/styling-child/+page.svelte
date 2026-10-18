<script lang="ts">
	import Child from './Child.svelte';
	import PostList from '$lib/components/PostList.svelte';
	type PostAuthor = {
		id: string;
		title: string;
		content: string;
		author: boolean;
		categoryIds: string;
		categoryNames: string;
		authorId: string;
		published: boolean;
		firstName: string;
		lastName: string;
		role: string;
		createdAt: Date;
		updatedAt: Date;
	}
</script>

<!-- Parent.svelte -->
<Child bgTheme="purple">
	<p
		style="--padding:1rem 2rem;color:white;width:20rem;height:6rem;display:flex;justify-content: center;align-items: start;"
	>
		Clean property passing
	</p>
</Child>
