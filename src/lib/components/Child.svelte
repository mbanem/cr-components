<script lang="ts">
  type ARGS = {
    array: number[];
  };
  let { array = $bindable([]) }: ARGS = $props();
</script>

<div class="a-border">
  <p style="margin:0;padding:0;">Parent and Child manage this array</p>
  <div class="wrapper">
    {#each array as n}
      <p>{n}</p>
    {/each}
  </div>
  Child area
  <button onclick={() => array.push(array.length)}>add next</button>
  <button onclick={() => array.pop()}>remove the last</button>
</div>

<!-- svelte-ignore css_unused_selector -->
<style lang="scss">
  .wrapper {
    display: flex;
    gap: 4px;
  }
  .a-border {
    width: max-content;
    padding: 10px 1rem;
    border: 1px solid gray;
    border-radius: 1rem;
  }
  p {
    display: inline-block;
  }
</style>
