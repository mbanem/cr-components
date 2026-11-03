<script lang="ts">
	import Tooltip from '$lib/components/CReactiveTooltip.svelte';
	import type { PageProps, PageData } from '../$types';
	// import ModelsHandler from './ModelsHandler.svelte';
	import ModelsHandler from '$lib/components/ModelsHandler.svelte';
	type Field = {
		name: string;
		type: string;
		isArray: boolean;
		isOptional: boolean;
		isDataEntry: boolean;
		attrs?: string;
		permissions?: string;
	};
	// no name; it should be part of Models with their name as a key
	type Model = {
		fields: Field[];
		attrs?: string[];
		permissions?: string;
	};
	type Models = Record<string, Model>;
	// type RouteName = string;
	type ModelName = string;
	type SelectedModel = Record<
		ModelName,
		{
			routeName: string;
			permissions?: string;
		}
	>;
	// type SelectedModels = Record<RouteName, SelectedModel>;
	type Components = string[];
	// type Payload = Record<string, SelectedModels | Model | Components | string>; // { route: string | null } = { route: null };
	type RouteName = string;
	type SelectedModels = Record<RouteName, Model>;
	type Payload = Record<string, SelectedModels | Model | string[] | string>;
	let tooltip: Tooltip;
	// type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };
	let { data, params }: PageProps = $props();

	let isActive = $state(false);
	let models = $state<Models>({ ...data.models }); // avoid $derived as we use this one-time only
	// console.log('data.enums', data.enums); // type TEnums = Record<string, Record<string, string>>;
	let isLoading = $state(true);
	// let userRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERTOR'];
	let userRoles = Object.keys(Object.values(data.enums)[0] as TEnum).filter(Boolean);
	// console.log('+page props', userRoles);
	setTimeout(() => {
		isLoading = false;
	}, 1000);
	let inAction = $state(false);

	let selectedModels = $state<SelectedModels>({});
	let crComponents: string[] = $state([
		'CRInput',
		'CRSpinner',
		'CRActivity',
		'CRTooltip',
		'CRSummaryDetails'
	]);

	// what authentication/authorization to implement should be optional?
	let appFeatures: string[] = $state([]);
	function toggleActive() {
		isActive = isActive ? false : true;
	}
	let appName = $state('dankenApp');
</script>

<pre>models {Object.keys(models).join(', ')} selectedModels {Object.keys(selectedModels).join(
		', '
	)}</pre>
<div class="main">
	<ModelsHandler bind:models bind:selectedModels bind:isLoading {appName} {userRoles}
	></ModelsHandler>
</div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
