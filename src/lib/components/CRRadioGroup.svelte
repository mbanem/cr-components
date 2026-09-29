<script lang="ts">
    import { untrack } from 'svelte';
    import { SvelteSet, SvelteMap } from 'svelte/reactivity';
    import { fade } from 'svelte/transition';
    import type { TRadioItem, TEntryMap, value } from '$lib/types';

    type Props = {
        caption?: string;
        radios: TEntryMap;
        selectedButton: string | null;
        disabledButtons?: SvelteSet<string>;
        reportOn?: 'change' | 'input';
        onValueChange?: (val: string | null) => void;
        itemMap?: SvelteMap<value, TRadioItem>;
        style?: string;
        class?: string;
    };

    let {
        caption,
        radios,
        reportOn = 'change',
        selectedButton = $bindable(null),
        disabledButtons = $bindable<SvelteSet<string>>(),
        onValueChange,
        itemMap = $bindable<SvelteMap<value, TRadioItem>>(),
        style = '',
        class: className = ''
    }: Props = $props();

    // Default bindings initialization
    if (!disabledButtons) disabledButtons = new SvelteSet<string>();
    if (!itemMap) itemMap = new SvelteMap<value, TRadioItem>();

    let imgPath = '/CRRadioGroup-setup.png';
    let timer: ReturnType<typeof setTimeout>;
    let radioValueInput = $state('');
    let labelForRadio = $state('Vanilla Ice Cream Crougger');
    let valueForRadio = $state('Ice Cream-V Crougger');
    let selectedForRadio = $state(false);
    let isZoomed = $state(false);

    // Group name for native HTML radio button linking
    const groupName = $derived(`cr-radio-${Math.random().toString(36).substring(2, 9)}`);

    // 1. Synchronize input entry entries map into internal reactive state
    $effect(() => {
        const boxes = Array.from(radios);

        untrack(() => {
            const currentKeys = new Set<string>();

            for (const [label, val] of boxes) {
                const valStr = Array.isArray(val) ? val[0] : val;
                const explicitDisabled = Array.isArray(val) ? (val[1] ?? false) : false;
                currentKeys.add(valStr);

                const initialChecked = selectedButton === valStr;
                const initialDisabled = explicitDisabled || disabledButtons.has(valStr);

                if (itemMap.has(valStr)) {
                    const existing = itemMap.get(valStr)!;
                    existing.label = label;
                } else {
                    let itemState = $state({
                        label,
                        selected: initialChecked,
                        disabled: initialDisabled
                    });
                    itemMap.set(valStr, itemState);
                }
            }

            // Cleanup removed keys
            for (const key of Array.from(itemMap.keys())) {
                if (!currentKeys.has(key)) {
                    itemMap.delete(key);
                }
            }
        });
    });

    // 2. Synchronize selection outward to parent & maintain single choice integrity
    $effect(() => {
        let activeSelected: string | null = null;
        const currentDisabled = new Set<string>();

        for (const [valKey, item] of itemMap.entries()) {
            if (item.selected) {
                if (activeSelected === null) {
                    activeSelected = valKey;
                } else {
                    // Enforce single selection if multiple items were toggled externally
                    item.selected = false;
                }
            }
            if (item.disabled) {
                currentDisabled.add(valKey);
            }
        }

        untrack(() => {
            selectedButton = activeSelected;

            disabledButtons.clear();
            currentDisabled.forEach((v) => disabledButtons.add(v));

            if (reportOn === 'change') {
                onValueChange?.(selectedButton);
            }
        });
    });

    let validValues = $derived(new SvelteSet(itemMap.keys()));

    // Target radio option handler helper
    function selectRadioOption(val: string) {
        for (const [k, item] of itemMap.entries()) {
            item.selected = k === val;
        }
    }

    // Exported Component API
    export function reset() {
        for (const item of itemMap.values()) {
            item.selected = false;
        }
    }

    export function selectOption(val: string) {
        if (validValues.has(val)) {
            selectRadioOption(val);
        }
    }

    function toggleDisabledByValue() {
        if (!validValues.has(radioValueInput)) {
            console.warn('Value matching key not found in Registry:', radioValueInput);
            return;
        }
        const item = itemMap.get(radioValueInput);
        if (item) {
            item.disabled = !item.disabled;
        }
    }

    export function removeItemByValue(val: string) {
        if (selectedButton === val) {
            reset();
        }
        itemMap.delete(val);
    }

    export function addItem(label: string, val: string, selected = false) {
        if (itemMap.has(val)) {
            removeItemByValue(val);
            return;
        }
        if (selected) {
            reset();
        }
        let newItem = $state({ label, selected, disabled: false });
        itemMap.set(val, newItem);
    }

    export function toggleRadioListByValue() {
        if (!labelForRadio || !valueForRadio) return;
        addItem(labelForRadio, valueForRadio, selectedForRadio);
    }
</script>

<div class="grid-container">
    <div class="cr-input-container {className}" {style} data-caption={caption}>
        <div class="radio-wrapper" role="radiogroup">
            {#each Array.from(itemMap.entries()) as [valKey, item] (valKey)}
                <label class="radio-label">
                    <input
                        type="radio"
                        name={groupName}
                        value={valKey}
                        checked={item.selected}
                        disabled={item.disabled}
                        onchange={() => selectRadioOption(valKey)}
                    />
                    <span class:item-disabled={item.disabled}>{item.label}</span>
                </label>
            {/each}
        </div>
    </div>

    <!-- Right Side: Thumbnail & Dynamic Popout Overlay -->
    <div class="thumbnail-wrapper">
        <img
            src={imgPath}
            alt="Instantiation code snippet summary"
            width="100"
            height="auto"
            class="thumbnail-img"
            onmouseenter={() => {
                timer = setTimeout(() => {
                    isZoomed = true;
                }, 600);
            }}
            onmouseleave={() => clearTimeout(timer)}
        />

        {#if isZoomed}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img
                src={imgPath}
                alt="Full instantiation code snippet"
                class="overlay-img"
                transition:fade={{ duration: 250 }}
            />
            <div class="hitbox-mask" onmouseleave={() => (isZoomed = false)} aria-hidden={true}></div>
        {/if}
    </div>

    <!-- Bottom Row: Demonstration Controls -->
    <div class="below">
        <input
            type="text"
            bind:value={radioValueInput}
            placeholder="Radio value string"
            style="width:12.2rem !important;"
        />
        <button onclick={toggleDisabledByValue}> Toggle disabled by radio value </button>
        <pre>At child. Number of disabled radio buttons: {disabledButtons.size}</pre>
        <div class="wrapper">
            <div class="single-row">
                <label for="lbl" style="display:block">
                    Label for new radio
                    <input
                        id="lbl"
                        type="text"
                        bind:value={labelForRadio}
                        placeholder="label for new radio"
                        style="width:12.2rem !important;"
                    />
                </label>
                <label for="val" style="display:block">
                    Value for new radio
                    <input
                        id="val"
                        type="text"
                        bind:value={valueForRadio}
                        placeholder="Value for new radio"
                        style="width:12.2rem !important;"
                    />
                </label>
                <label for="sel" style="display:block;margin-left:-6px;">
                    Selected
                    <input
                        id="sel"
                        type="checkbox"
                        bind:checked={selectedForRadio}
                        style="margin-top:8px;"
                    />
                </label>
            </div>
            <button onclick={toggleRadioListByValue} style="margin-top:0.7rem;">
                Add new or remove a radio item from the list
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    .cr-input-container {
        @include container();
        width: 30.8rem;
        .radio-wrapper {
            width: 22.4rem;
        }
        padding: 0 0 10px 1rem;
        margin-top: 1rem;
    }

    .wrapper {
        @include container($caption: 'Add new or Remove Radio from the List',$caption-color: navy);
        padding: 10px 6px;
        margin: 0;
        .single-row {
            display: flex;
            gap: 1rem;
            align-items: flex-end;

            label {
                font-size: 0.9rem;
                font-weight: 500;
            }

            input {
                display: block;
                margin-top: 0.25rem;
            }
        }
    }

    .radio-label {
        cursor: pointer;
        display: block;
        margin-bottom: 0.4rem;
    }
    .grid-container {
        display: grid;
        grid-template-columns: 18rem 6.5rem;
        align-items: start;
        column-gap: 2rem;
    }
    .below {
        grid-column: 1 / span 2;
        margin-top: 10px;
    }
    .thumbnail-wrapper {
        margin-top: 1.3rem;
        position: relative;
        display: inline-block;
    }
    .item-disabled {
        color: gray;
        text-decoration: line-through;
    }
    .thumbnail-img {
        margin: 1.1rem 0 0 4rem;
        cursor: zoom-in;
        display: block;
    }
    %overlay-dimensions {
        position: absolute;
        top: 0px;
        left: -314px;
        width: 479px;
        height: auto;
        aspect-ratio: 400 / 300;
        border-radius: 8px;
    }
    .overlay-img {
        @extend %overlay-dimensions;
        z-index: 100;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        border: 1px solid #ccc;
        background-color: #1e1e1e;
    }
    .hitbox-mask {
        @extend %overlay-dimensions;
        z-index: 101;
        background: transparent;
        cursor: zoom-out;
    }
</style>