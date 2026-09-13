<script lang="ts">
  type Person = {
    name: string;
    age: number;
  };
  type PROPS = {
    person: Person;
  };
  let { person = $bindable() }: PROPS = $props();
</script>

<div class="child-container">
  <input type="text" placeholder="put the name here" bind:value={person.name} />
  <br />
  <label for="age">Person age</label>
  <input
    type="number"
    bind:value={person.age}
    min="1"
    max="105"
    id="age"
    style="width:4rem"
  />
  <button onclick={() => (person.age += 1)}>increment age</button>
  <button onclick={() => (person.age -= 1)}>decrement age</button>
</div>

<style lang="scss">
  .child-container {
    @include container(
      $head: 'Child Real Estate',
      $width: 43.4rem // $border: 1px solid lightgreen
    );
  }
</style>
