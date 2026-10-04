<script lang="ts">
  type CompProps = {
    formaction?: string;
    caption?: string;
  };
  let {
    button = $bindable<HTMLButtonElement>(),
    formaction,
    caption = 'save form  data',
  }: { button: HTMLButtonElement } & CompProps = $props();
</script>

<button
  bind:this={button}
  type="submit"
  {formaction}
  aria-label="submit"
  aria-hidden="true">{caption}</button
>
