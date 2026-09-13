<!-- 
@component
	Bindable component accept props and make them bindable so
	parent component can bound them to have full access to them
		type Handler = (delta: number, event?: MouseEvent) => void
		type ARGS = {
			count: number
			clickArg: Handler
		}
	let { count = $bindable(0), clickArg = $bindable() }: ARGS = $props()
	The Component is calling clickArg handler to increment parent's count
	by delta value while parent uses its local click function to increment by 1
-->

<script lang="ts" module>
  import { browser } from '$app/environment';
  // in order to export a function to parent we need a script with context module
  // beside the regular script block

  // child component local childCount variable when called from parent
  let childCount = $state<number>(0);
  export const counter = (delta: number) => {
    childCount += delta;
    // console.log('parent call ', delta)
    if (browser) {
      const el = document.getElementById('test') as HTMLDivElement;
      if (el) {
        el.innerText = 'OK, new text is here';
      }
      if (spanX) {
      }
    }
  };
</script>

<script lang="ts">
  type Handler = (delta: number, event?: MouseEvent) => void;

  // parent sent props numeric variable and a handler function
  type ARGS = {
    count: number;
    clickArg: Handler;
  };
  let { count = $bindable(0), clickArg = $bindable() }: ARGS = $props();

  const increment = () => {
    count += 1;
  };
  let delta = $state<number>(-3);
  const updateParentCount = (event: MouseEvent) => {
    // call parent function with incremental value
    clickArg(delta, event);
  };
  let spanX: HTMLSpanElement | null = null;
</script>

<button onclick={() => counter(1)}>counter add 1</button>
<div id="test">change me from module</div>
<p class="inline">
  child local counter
  <span class="expression-highlighted">
    {childCount}
  </span>
</p>
<p style="margin-left:2rem;color:lightgreen;">
  CHILD SPACE: child count updated by parent
  <span style="font-size:24px;color:yellow;">
    {childCount}
  </span>
</p>
<div class="wrapper">
  <pre>This is child component.
Child button clicked changing parent count
<span bind:this={spanX} class="expression-highlighted">
  {count}
</span>
</pre>
  <!-- the pre css rules change button css rules dramatically
		so as the first line of defense get otu of pre as parent
-->
  <button style="display:block;" onclick={increment}>
    child click changing sharable bound count variable</button
  >
  Parents clickArg (_:number)=&gt; void updates parent's count calling parent's function
  <label for="delta"
    >Delta
    <input id="delta" type="number" bind:value={delta} />
  </label>
  <button class="update-parent-button" onclick={updateParentCount}>
    call parent to update its count by delta={delta}
  </button>
</div>

<!-- svelte-ignore css_unused_selector -->
<style lang="scss">
  .expression-highlighted {
    font-size: 24px;
    color: yellow;
  }
  .wrapper {
    // display: inline-block;
    @include container($head: 'Child Estate', $head-color: skyblue);
    width: 60.5vw;
    margin: 0 0 0 2rem;
    p {
      color: skyblue;
      border: 0;
      padding: 0;
    }
  }
  .inline {
    display: inline-block;
  }
  pre {
    font-size: 15px;
  }
</style>
