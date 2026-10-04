<script lang="ts">
    import { SvelteSet, SvelteMap } from 'svelte/reactivity';
    import CRRadioGroup from '$lib/components/CRRadioGroup.svelte';
    import type { TRadioItem, TEntryValue, TEntryMap, value } from '$lib/types';
    import { tick } from 'svelte';

    const disabled = true;
    let msg: HTMLParagraphElement;
    let timer: ReturnType<typeof setTimeout>;
    let placeholder = 'message placeholder';
    let placeholderIn = $state(true);

    async function logm(message: string) {
        await tick();
        if (!msg || msg.innerText === '') {
            console.log(message);
        } else {
            msg.innerText = message;
        }
        placeholderIn = false;
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (msg) msg.innerText = placeholder;
            placeholderIn = true;
        }, 3000);
    }

    let entryMap: TEntryMap = new SvelteMap<value, TEntryValue>([
        ['German bred Pumpernickel', 'Pumpernickel'],
        ["Hershey's Chocolate Milk", 'Hershey'],
        ['Brasilian French-Roast Coffee Melitta', 'Melitta'],
        ['Milka Chocolate Lila', ['Lila', disabled]],
        ['Dove Soap Original Beauty Bar', 'Original Beauty Bar']
    ]);

    let itemMap = new SvelteMap<value, TRadioItem>();
    let groupComponent: ReturnType<typeof CRRadioGroup>;

    function handleReset() {
        groupComponent?.reset();
    }

    function onValueChange(val: string | null) {
        selectedButton = val;
    }

    let affectByValue = $state('');

    async function remotelyToggleRadio() {
        await tick();
        try {
            const item = itemMap.get(affectByValue);
            if (item) {
                if (item.disabled) {
                    logm(`Cannot select ${affectByValue}: Radio button is disabled.`);
                } else {
                    // Deselect all others and select targeted item
                    for (const [k, v] of itemMap.entries()) {
                        v.selected = k === affectByValue ? !v.selected : false;
                    }
                }
            } else {
                logm('Incorrect name specified');
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(errorMsg);
        }
    }

    async function remotelyDisable() {
        await tick();
        try {
            const item = itemMap.get(affectByValue);
            if (item) {
                item.disabled = !item.disabled;
            } else {
                logm('Incorrect name specified');
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(errorMsg);
        }
    }

    let selectedButton = $state<string | null>('Melitta');
    let disabledButtons = new SvelteSet<value>(['Hershey']);
</script>

<p>input {affectByValue}</p>
<div class="controls">
    <p>selectedButton at parent: <span style="color:blue;">{selectedButton ?? 'None'}</span></p>
    <p>disabledButtons at parent: <span style="color:red;">{disabledButtons.size}</span></p>
    <br />
    <input type="text" bind:value={affectByValue} placeholder="affect radio (its value)" />
    <button onclick={remotelyToggleRadio}>parent: Toggle selected</button>
    <button onclick={remotelyDisable}>parent: Toggle disabled</button>
</div>
<div class="controls" style="margin-top:6px;">
    <button onclick={handleReset}>reset selection</button>
    <p bind:this={msg} class="message" style={`color:${placeholderIn ? 'gray' : 'crimson'}`}>
        {placeholder}
    </p>
</div>
<div style="max-width: 18rem; padding: 6px 1rem;">
    <CRRadioGroup
        caption="Select Product"
        radios={entryMap}
        reportOn="change"
        {onValueChange}
        bind:this={groupComponent}
        bind:selectedButton
        bind:disabledButtons
        bind:itemMap
        style="border-color:green;"
        class="main"
    />
</div>

<div style="margin: 0.5rem 0 0 1rem;">
    At parent. Selected Product:
    {#if selectedButton}
        <p class="product">{selectedButton}</p>
    {:else}
        <p class="product" style="color: gray;">None</p>
    {/if}
</div>

<style lang="scss">
    .product {
        display: block;
        color: blue;
        padding: 1px 0;
        margin: 0 0 0 1rem;
    }
    p {
        display: inline-block;
        padding: 1px;
        margin: 0 1.8rem 0 0;
    }
    .message {
        font-size: 13px;
        font-style: italic;
        color: crimson;
        border: 1px solid lightgray;
        border-radius: 3px;
        width: 16rem;
        padding: 3px 0 0 0.5rem;
    }

    .controls {
        padding: 0;
        margin: 1rem 0 0 1rem;
    }
</style>