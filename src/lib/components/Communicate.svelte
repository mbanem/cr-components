<script lang="ts">
	type ARGS = {
		person: Person
		city: string
		userAge: number
	}
	let { person = $bindable(), city = '', userAge }: ARGS = $props()

	const decrement = (event: MouseEvent) => {
		event.stopPropagation()
		if (person.age > 1) {
			person.age -= 1
		}
	}
</script>

<div class="container">
	<p style="color:skyblue;">This is the child block</p>
	<input type="text" placeholder="put the name here" bind:value={person.name} />
	<br />
	<label for="age">Person age</label>
	<input
		type="number"
		bind:value={person.age}
		min="1"
		max="105"
		id="age"
		style="width:2rem;margin:0;"
	/>
	<p>While city and userAge are child variables they are exported but not changed</p>
	<p>Fixed: Leaving in {city} of age {userAge}</p>
	While Person is exported where name and age are controlled
	<br />
	as in here
	<span style="color:skyblue">Person {person.name} age {person.age} city {person.city}</span>
	<button onclick={() => (person.age += 1)}>increment age</button>
	<button onclick={decrement}>decrement age</button>
</div>

<style lang="scss">
	.container {
		padding: 0 1rem;
		border: 1px solid blue;
		border-radius: 6px;
		width: 80vw;
	}
	p {
		margin: 0;
		padding: 8px 0;
	}
</style>
