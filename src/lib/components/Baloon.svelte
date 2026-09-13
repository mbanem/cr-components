<!--
@component
Component Ballon.svelte accepts 
	type PROPS = {
		size: number
		power: number
		inflate: (n: number) => void
		deflate: (n: number) => void
	}
	The inflate and deflate increment/decrement size for amount of  power to change the balloon size
-->

<script lang="ts">
  type PROPS = {
    size: number;
    power: number;
    inflate: (n: number) => void;
    deflate: (n: number) => void;
  };
  // component get props
  let {
    inflate,
    deflate,
    size = $bindable(),
    power = $bindable(),
  }: PROPS = $props();
</script>

<div class="wrapper">
  <button onclick={() => inflate(power)}>inflate</button>
  <button onclick={() => deflate(power)}>deflate</button>
  <button onclick={() => inflate(51)}>explode</button>

  <pre>
	We can change parent's pump power from the child
	Pump power: &lcub;power&rcub; 
	&lt;button onclick=&lcub;() =&gt; power--&rcub;&gt;-&lt;/button&gt;  
	&lt;button onclick=&lcub;() =&gt; power++&rcub;&gt;+&lt;/button&gt;
	</pre>
</div>

<!-- svelte-ignore css_unused_selector -->
<style lang="scss">
  .wrapper {
    display: flex;
    align-items: flex-start;
    padding: 0 1rem;
    pre {
      margin: 0;
      padding: 0;
    }
  }
  button {
    display: inline-block;

    &:not(last-child) {
      margin-right: 0.5rem;
    }
  }
</style>
