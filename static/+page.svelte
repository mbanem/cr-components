<script lang="ts">
  let images = [
    'bird.webp',
    'cat.webp',
    'lake.jpg',
    'bridge.jpg',
    'eiffel-tower.jpg',
  ];

  // let boxSize = $state(25);
  let hoverImg: string | null = null;
  let cursorX = 0;
  let cursorY = 0;
  let boxSize = 25;
  let imgRect: DOMRect | null = null;

  function handleMouseMove(e: MouseEvent, img: string, el: HTMLImageElement) {
    const rect = el.getBoundingClientRect();
    imgRect = rect;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorX = Math.max(
      (80 - boxSize) / 2,
      Math.min(x, rect.width - (80 - boxSize) / 2),
    );
    cursorY = Math.max(
      (80 - boxSize) / 2,
      Math.min(y, rect.height - (80 - boxSize) / 2),
    );

    hoverImg = img;
  }

  function handleMouseLeave() {
    hoverImg = null;
    imgRect = null;
  }

  function zoomStyle(): string {
    if (!hoverImg || !imgRect) return '';
    const scale = 600 / (80 - boxSize);

    const bgX = -(cursorX - (80 - boxSize) / 2) * scale;
    const bgY = -(cursorY - (80 - boxSize) / 2) * scale;

    return `background-image: url("/${hoverImg}");
      background-size: ${imgRect.width * scale}px ${imgRect.height * scale}px;
      background-position: ${bgX}px ${bgY}px;`;
    // console.log(rv);
    // return rv;
    // return {
    //   backgroundImage: `url("/${hoverImg}")`,
    //   backgroundSize: `${imgRect.width * scale}px ${imgRect.height * scale}px`,
    //   backgroundPosition: `${bgX}px ${bgY}px`,
    // };
  }
</script>

<div class="grid">
  <div class="left">
    {#each images as img}
      <div
        class="thumb-wrapper"
        onmouseleave={handleMouseLeave}
        aria-hidden={true}
      >
        <!-- eslint-disable-next-line svelte/valid-aria-roles -->
        <img
          src={'/' + img}
          alt="thumbnail"
          aria-hidden={true}
          role="presentation"
          width="100"
          height="100"
          onmousemove={(e) =>
            handleMouseMove(e, img, e.currentTarget as HTMLImageElement)}
        />
        {#if hoverImg === img}
          <div
            class="zoom-box"
            style="left:{cursorX - (80 - boxSize) / 2}px; top:{cursorY -
              (80 - boxSize) / 2}px;  width:{80 - boxSize}px;height:{80 -
              boxSize}px;"
            aria-hidden={true}
          ></div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="right">
    <p>Hover over an image to see it in greater details</p>
    {#if hoverImg}
      <div class="zoomed" style={zoomStyle()}></div>
    {/if}
  </div>
  <label for="r"
    >Zoom Box Size
    <input
      id="r"
      type="range"
      min="1"
      max="70"
      bind:value={boxSize}
      list="values"
    />
    <datalist id="values">
      {#each [...8] as val}
        <option value={val * 10} label={val * 10}></option>
      {/each}
    </datalist></label
  >
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
    height: 100vh;
  }
  .left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  .thumb-wrapper {
    position: relative;
  }
  .thumb-wrapper img {
    display: block;
    width: 100px;
    height: 100px;
    object-fit: cover;
  }
  .zoom-box {
    position: absolute;
    border: 1px solid yellow;
    background: rgba(255, 255, 0, 0.1);
    pointer-events: none;
  }
  .right {
    position: relative;
    padding: 1rem;
  }
  .zoomed {
    position: absolute;
    top: 0;
    left: 0;
    width: 600px;
    height: 600px;
    border: 1px solid #ccc;
    background-repeat: no-repeat;
    z-index: 10;
  }
  datalist {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    writing-mode: horizontal-tb;
    width: 250px;
  }

  input[type='range'] {
    width: 250px;
    margin: 0;
  }
</style>
