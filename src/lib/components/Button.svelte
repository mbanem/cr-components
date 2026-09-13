<script lang="ts">
  // import type { MouseEventHandler } from 'svelte/elements';
  type ARGS = {
    handleClick: (event: MouseEvent, delta: number) => void;
  };
  let { handleClick }: ARGS = $props();

  let delta = $state<number>(4);
  const click = (event: MouseEvent, delta: number) => {
    // console.log('child click', handleClick);
    handleClick(event, delta);
  };
  const increment = (event: MouseEvent) => {
    click(event, delta);
  };
  const decrement = (event: MouseEvent) => {
    click(event, -delta);
  };
</script>

<div class="wrapper">
  <button class="button" onclick={increment}> increment by {delta} </button>
  <button class="button" onclick={decrement}> decrement by {delta} </button>
  <label for="digit">
    Set incremental value
    <input
      id="digit"
      type="number"
      bind:value={delta}
      placeholder="Increment"
    />
  </label>
</div>

<!-- svelte-ignore css_unused_selector -->
<style lang="scss">
  #digit {
    display: inline-block;
    margin: 1rem 0 1rem 0;
    width: 5rem;
    text-align: center;
    margin: 1rem 0;
  }
  .button {
    display: inline-block;
    width: 14rem;
    border: 1px solid gray;
    border-radius: 6px;
    padding: 6px 1rem;
    margin: 1rem 0 1rem 0;
    color: white;
    background-color: navy;
    text-align: center;
    cursor: pointer;
    &:hover {
      color: yellow;
      border-color: yellow;
    }
  }
  .wrapper {
    @include container(
      $head: 'Button -- A  Child Component',
      $head-color: lightgreen
    );
    width: 51rem;
    margin-top: 4rem;
  }
</style>
