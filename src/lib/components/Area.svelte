<script lang="ts">
  import { globalVolume } from '$lib/utils/counter.svelte';
  import { set } from 'zod';
  // Svelte 5 introduces the $derived and $effect runes, which instead determine the dependencies
  // of their expressions when they are evaluated, not like $: when they are compiled
  // so they are reactive objects
  // of their expressions when they are evaluated, not like $: when they are compiled
  // so they are reactive objects
  type WH_PH = { width: number; height: number; pHeight: number };
  let { width, height, pHeight }: WH_PH = $props(); // instead of `export let`

  const area: number = $derived(width * height);
  // const volume:number = $derived(area * pHeight);
  $effect(() => {
    globalVolume.volume = area * pHeight;
  });
  //  dynamic array
  //  dynamic array
  let numbers = $state([1, 2, 3]);
</script>

<!--&lcub; and &rcub are open and  closed Curly BRackets -->
<section class="horizontal-block">
  <div>
    <pre>
	Area Component
Rectangle with dimensions <span class="expression-highlighted"
        >&lcub;width}x&lcub;height}</span
      > has area of <span class="expression-highlighted">&lcub;area}</span>
Rectangle with dimensions <span class="expression-highlighted"
        >&lcub;width}x&lcub;height}</span
      > has area of <span class="expression-highlighted">&lcub;area}</span>
globalVolume.volume for parallelepiped
with dimensions <span class="expression-highlighted"
        >&lcub;width}x&lcub;height}x&lcub;pHeight} </span>
	is 
	<span class="expression-highlighted">&lcub;globalVolume.volume}</span>
</pre>
  </div>

  <div>
    <p>Area {height} * {width} = <span class="lightgreen">{area}</span></p>
    <p>
      Volume {height} * {width} * {pHeight} =
      <span class="lightgreen">{globalVolume.volume}</span>
    </p>
  </div>

  <div>
    <pre>
numbers is a $state rune of Array&lt;number> [1,2,3...]
where buttons add or remove the next number
with last line rendering the total
<button onclick={() => numbers.push(numbers.length + 1)}> add </button> <button
        onclick={() => numbers.pop()}> remove </button>  {numbers.join(' + ') ||
        0} = {numbers.reduce((a, b) => a + b, 0)}
</pre>
  </div>
</section>

<style lang="scss">
  pre {
    margin: 0;
    padding: 8px 1rem;
  }
  .lightgreen {
    color: lightgreen;
    font-size: 24px;
  }
  .horizontal-block {
    display: grid;
    grid-template-columns: 39rem 15rem 30rem;
    width: 90vw;
    margin: 1rem auto;
    margin-top: 2rem;
    background-color: #4e4e5e !important;
    border-radius: 10px;
  }
</style>
