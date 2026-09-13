<script lang="ts">
  import { browser } from '$app/environment';
  import { type Snippet } from 'svelte';
  // for items of different type embedded in <NavBar objects>
  const makeCSSClass = (cssClassDef: string) => {
    try {
      if (!browser || !document) return;
      let s = document.createElement('style');
      s.innerHTML = cssClassDef;
      document.head.appendChild(s);
    } catch (err) {
      console.log(err);
    }
  };
  let { children }: { children: Snippet<[]> } = $props();
  // const callMakeCSSClass = async () =>
  // 	await

  // NOTE: /static/ global.scss contains navbar-button
  // but @extend navbar-button does not work
  makeCSSClass(
    `.nav-bar-form {
		display: inline-block;
		background-color: rgb(5, 5, 153);
		color: lightgreen;
		border-radius: 5px;
		padding: 2px 0.5rem;
		border: 2px solid transparent;
		text-align: center;
		min-width: 6rem;
		height: 1.5rem;
		font-size: 20px;
		cursor: pointer;
		user-select: none;
		user-select: none;
		outline: none;
		margin: 0 4px;
		text-transform: uppercase;
		&:hover {
			color: yellow;
			border-color: lightgreen;
		}
	}
	.nav-bar-form:hover {
		color: yellow;
		border-color: lightgreen;
	}
	.nav-bar-form button {
		display: inline-block;
		width: 5rem;
		color: inherit;
		background-color: inherit;
		border: none;
		line-height: inherit;
		text-transform: capitalize;
		font-size: inherit;
		font-family: inherit;
		margin: 0;
		padding: 0;
	}`,
  );
</script>

<div class="container">
  <!-- {callMakeCSSClass()} -->
  {@render children()}
</div>

<style>
  .container {
    display: flex;
    gap: 5px;
    z-index: 1;
    background-color: var(--BODY-BACKGROUND-COLOR);
    /* align-items: stretch; */
  }
</style>
