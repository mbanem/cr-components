<script lang="ts">
  export interface ContextAction {
    label: string;
    action: () => void;
  }

  let {
    options = [],
    showMenu = $bindable(false)
  }: {
    options: ContextAction[];
    showMenu?: boolean;
  } = $props();

  let menuPos = $state({ x: 0, y: 0 });

  export function openMenu(e: MouseEvent) {
    e.preventDefault();
    menuPos = { x: e.clientX, y: e.clientY };
    showMenu = true;
  }

  function closeMenu() {
    showMenu = false;
  }

  function execute(action: () => void) {
    action();
    closeMenu();
  }
</script>

<svelte:window onclick={closeMenu} onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

{#if showMenu}
  <div class="context-menu" style="top: {menuPos.y}px; left: {menuPos.x}px;">
    {#each options as item}
      <button type="button" onclick={() => execute(item.action)}>
        {item.label}
      </button>
    {/each}
  </div>
{/if}