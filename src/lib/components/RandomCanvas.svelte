<script lang="ts">
  import { onMount, tick } from 'svelte';

  let color = $state('#ff3e00');
  let backColor = $state('#a08090');
  let lblColor: HTMLInputElement;

  let canvas1: HTMLCanvasElement;
  let canvas2: HTMLCanvasElement;
  let ctx1: CanvasRenderingContext2D;
  let ctx2: CanvasRenderingContext2D;
  let size1 = $state<number>(80);
  let size2 = $state<number>(80);
  let ctx2Text = 'Canvas Two';

  const hexColors = () => {
    let c = '#';
    let bc = '#';
    [0, 1, 2].forEach((_) => {
      const v = Math.floor((Math.random() * 1000) % 255);
      c = c + ('0' + v.toString(16)).slice(-2);
      bc = bc + ('0' + (255 - v).toString(16)).slice(-2);
    });
    return [c, bc];
  };

  const getFontSize = (
    txt: string,
    maxWidth: number,
    ctx: CanvasRenderingContext2D,
    px: boolean = false,
  ) => {
    let work = true;
    let fontSize = 300; //= '48px serif';
    while (work) {
      ctx.font = `${fontSize}px serif`;
      if (ctx.measureText(txt).width > maxWidth) {
        fontSize -= 1;
      } else {
        work = false;
      }
    }
    return px ? (`${fontSize}px serif` as string) : (fontSize as number);
  };

  let initial = true;
  const setColor = async () => {
    if (initial) {
      size1 = size2 = 80;
      initial = false;
    } else {
      size1 = 50 + Math.floor((Math.random() * 1000) % 150);
      size2 = 50 + Math.floor((Math.random() * 1000) % 150);
    }
    let cbc = hexColors();
    color = cbc[0] as string;
    backColor = cbc[1] as string;
    ctx1.fillStyle = 'lightgreen';
    ctx1.font = getFontSize(String(size1), canvas1.width, ctx1, true) as string; //'20px serif';
    let mt = ctx1.measureText(String(size1));
    let h = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent;
    ctx1.fillText(String(size1), 0, canvas1.height / 2);

    ctx2.font = getFontSize(ctx2Text, canvas2.width, ctx2, true) as string;
    mt = ctx2.measureText(ctx2Text);
    h = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent;
    ctx2.fillText(ctx2Text, 0, canvas2.height / 2);
    await tick();
    await render(canvas1, ctx1, size1, String(size1));
    await render(canvas2, ctx2, size2, ctx2Text);
  };

  const render = async (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    size: number,
    text: string,
  ) => {
    if (!(canvas && ctx)) return;
    let cbc = hexColors();
    color = cbc[0] as string;
    backColor = cbc[1] as string;
    ctx.fillStyle = backColor;
    ctx.fillRect(0, 0, size, size);
    await tick();
    lblColor.style.backgroundColor = backColor;

    // render text after filling background to get on top
    ctx.fillStyle = color;
    ctx.font = getFontSize(text, canvas.width, ctx, true) as string;

    const mt = ctx.measureText(text);
    const h = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent;
    const delta = typeof Number(text) === 'number' ? h / 2 : -h / 2;

    ctx.fillText(text, 0, canvas.height / 2 + delta);
  };

  $effect(() => {
    if (!canvas1) return;
    const text = String(size1);
    ctx1 = canvas1.getContext('2d') as CanvasRenderingContext2D;

    // fillStyle is applied to everything then follow, text and/or background
    // to make text and background of different colors set fillStyle before
    // fillText for text and set fillStyle again for fillRect for background
    //		set fillStyle for text and fillText, then
    //		set fileStyle again for background and fillRect
    ctx1.fillStyle = backColor;
    ctx1.fillRect(0, 0, size1, size1);
    ctx1.font = getFontSize(text, canvas1.width, ctx1, true) as string;

    const mt = ctx1.measureText(text);
    const h = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent;

    ctx1.fillStyle = color;
    ctx1.fillText(text, 0, canvas1.height / 2 + h / 2);
  });

  onMount(async () => {
    ctx1 = canvas1.getContext('2d') as CanvasRenderingContext2D;
    ctx2 = canvas2.getContext('2d') as CanvasRenderingContext2D;
    await setColor();
  });
</script>

<!-- <p>This is a RandomCanvas component</p> -->
<div class="controls">
  <label for="y" class="color-dialog-box">
    Resize the first box on the right
    <input id="y" type="range" min="20" max="300" bind:value={size1} />
  </label>

  <label for="w" class="color-dialog-box"
    >pick color from color dialog box
    <!-- <input type="color" bind:value={color} /> -->
    <input id="w" bind:this={lblColor} type="color" bind:value={color} />
  </label>
  <div class="column">
    <button class="generate-color-button" onclick={setColor}
      >random color</button
    >
    <p style={`color:${backColor};background-color:${color}`}>color {color}</p>
    <p style:color style:background-color={backColor}>back color {backColor}</p>
  </div>
  <div class="canvases">
    <canvas bind:this={canvas1} class="canvas-1" width={size1} height={size1}
    ></canvas>
    <canvas bind:this={canvas2} class="canvas-2" width={size2} height={size2}
    ></canvas>
  </div>
</div>

<style lang="scss">
  .color-dialog-box {
    display: inline-block;
    color: lightgreen;
    width: 10rem;
    text-align: center;
    input {
      margin-top: 1rem;
      cursor: pointer;
    }
  }
  .column {
    display: flex;
    flex-direction: column;
    width: 13rem;
    text-align: center;
    p {
      display: inline-block;
      border-radius: 4px;
      margin: 0;
      padding: 3px 1rem;
    }
  }
  .canvas-1,
  .canvas-2 {
    border: 4px solid lightgreen;
  }
  .controls {
    width: 60rem;
    border: 1px solid yellow;
    padding: 1em 0 1em 1rem;
    margin: 0;
    display: flex;
    gap: 1em;
  }
  .generate-color-button {
    display: inline-block;
    height: 3rem;
    border: 1px solid lightgreen;
    cursor: pointer;
    &:hover {
      border-color: yellow !important;
      color: yellow;
    }
  }
  .canvases {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
