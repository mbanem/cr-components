<script lang="ts">
	import { fade } from 'svelte/transition';
	import HoveringDetails from '$lib/components/HoverableDetails.svelte';
	import Tooltip from '$lib/utils/reactive-tooltip';
	import { tick } from 'svelte';
	let tooltip: Tooltip = new Tooltip();
	let rawLines = $state<string[]>(['raw line one', 'raw line 2']);
	let isOpen = $state(false);
	let isInstalling = $state(false);
	let paramsAreValid = $state(false);
	let dbParamsMissing = $state(false);
	let existingDbParts = $state('');

	let mandatoryEntriesEl: HTMLDivElement;
	let paramsValidEl: HTMLDivElement;
	let dbDepondOnRoleEl: HTMLDivElement;
	let validateDbParamsEl: HTMLDivElement;

	let arrDBParamsStatus: string[] = $state([]);

	let progressPercents = $state(0);
	let statusMessage = $state('Status Message');
	let currentTask = $state('Current Task');
	let progressMsg = $state('Progress Msg');
	let progressCollector = $state<Record<string, string[]>>({
		summary1: ['details 1'],
		summary2: ['details 2'],
		summary3: ['details 3'],
		summary4: ['details 4']
	});
	const inputBoxes = {
		name: ['Database Name', 'text'],
		owner: ['Database Owner', 'text'],
		password: ["Owner's Password", 'password'],
		host: ['Host Name', 'text'],
		port: ['Communication Port', 'number'],
		adminName: ['Database Role (Admin Name)', 'text'],
		adminPwd: ['Database Role Password', 'password']
	};
	type DbEls = Record<string, HTMLInputElement | null>;
	const dbState = $state<{ db: DbParams; els: DbEls }>({
		db: {
			name: 'dbrony',
			owner: 'rony',
			password: 'rony',
			host: 'localhost',
			port: 5432,
			adminName: 'mili',
			adminPwd: 'kiki'
		},
		els: {
			name: null,
			owner: null,
			password: null,
			host: null,
			port: null,
			adminName: null,
			adminPwd: null
		}
	});
	function markEmptyDbParamFields() {
		for (const key of Object.keys(dbState.els)) {
			const el = dbState.els[`${key}El`] as HTMLInputElement;
			if (el) {
				el.style.backgroundColor = String(el.value).trim() === '' ? '#f4cdcd' : '';
				setTimeout((el: HTMLInputElement) => {
					el.focus();
				}, 200);
			}
		}
	}
	function showMandatoryEntries(e: MouseEvent) {
		e.preventDefault();
		if (isInstalling) {
			tooltip.hide();
			return;
		}

		if (dbParamsMissing) {
			// console.log('[OrmmOne] showMandatoryEntries open dbParams')
			// tooltip.show(e, mandatoryEntriesEl, -1, 'below', {color:'tomato'},validateMsgClosed)
			tooltip.show(e, mandatoryEntriesEl, -1, 'below', { color: 'tomato' });

			markEmptyDbParamFields();
			// open db parameters block for user for db admin credentials
			isOpen = true;
		} else if (paramsAreValid) {
			tooltip.show(e, paramsValidEl, -1, 'below', { color: 'navy' });
			isOpen = false;
		} else {
			if (!arrDBParamsStatus.join('').includes('Params are Valid')) {
				// console.log('[OrmmOne] showMandatoryEntries open parms are walid')
				tooltip.show(e, validateDbParamsEl, 3000, 'below');
				isOpen = true;
			} else {
				// console.log('[OrmmOne] showMandatoryEntries close dbParams')
				isOpen = false;
			}
		}
	}
	const sleep = async (ms: number) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				// ms here is a dummy but required by
				// resolve to send out some value
				resolve(ms);
			}, ms);
		});
	};
	async function installing() {
		progressPercents = 0;
		isInstalling = !isInstalling;
		while (isInstalling && progressPercents < 100) {
			progressPercents++;
			await sleep(200);
		}
	}
	function emptyField(k: string) {
		return dbState.db[`${k}`] === '';
	}
</script>

{#if isInstalling || progressPercents}
	<div class="message-container">
		<p style="padding:0;margin:0;position:relative;">
			<progress value={progressPercents} max="100" class="progress"></progress>
			{statusMessage}
			<span
				style="display:inline-block;position:absolute;top:-0.6em;left:4rem;color:black;font-size:15px;font-weight: 600;"
				>{progressPercents}%</span
			>
		</p>
	</div>
	{#key currentTask}
		<div class="current-task">
			<!-- <span class:green-spinner={!currentTask.includes(prismaInitialized)}></span> -->
			<p style="display:inline-block;" transition:fade={{ duration: 250 }}>
				<span style="padding-left:1rem;color:var(--green-type)">{currentTask} {progressMsg}</span>
			</p>
		</div>
	{/key}
{/if}
<!-- <div style="border:1px solid red;height:36rem;"> -->
<div class="grid-container">
	<div class="left-column">
		<label class="dependencies-label">
			<input type="checkbox" style="display:inline-block;" />
			Pre-approve common build dependencies (recommended)
		</label>
		<div class="progress-line" class:progress-active={isInstalling}>
			<span class="progress-title" style="margin-left:0.5rem;width:93.3%;">Progress</span>
			<!-- <p bind:this={progressLineEl}></p> -->
		</div>
		{#each Object.entries(progressCollector) as [summary, details] (summary)}
			<HoveringDetails {summary} {details} />
		{/each}
	</div>
	<div class="right-column">
		<div class="buttons-row">
			<button
				class="button-install"
				onmouseenter={showMandatoryEntries}
				onmouseleave={() => {
					tooltip.hide();
				}}
				disabled={dbParamsMissing}
			>
				<span class:spinner={isInstalling}></span>
				Install Packages
			</button>
			<button onclick={closetheApp} class="button-close">close</button>
		</div>
		<pre class="raw-lines">{rawLines}</pre>
	</div>
</div>
<!-- {#if approvalPackages.length > 0}
	<div class="approval-section">
		<p>
			<strong>Some packages require approval to run build scripts:</strong>
		</p>
		<ul>
			{#each approvalPackages as pkg (pkg)}
				<li>
					<button onclick={(e: MouseEvent) => approvePackage(e, pkg)}>{pkg}</button>
				</li>
			{/each}
		</ul>
		<button onclick={approveAll}>Approve All</button>
	</div>
{/if} -->

<button onclick={installing}>toggle isInstalling</button>
<button onclick={() => (paramsAreValid = !paramsAreValid)}>toggle paramsAreValid</button>

<div class="no-credentials" bind:this={mandatoryEntriesEl}>
	<p>Without Credentials for Managing DB</p>
	<p>Role and DB cannot be created and</p>
	<p>Prisma ORM will be left inoperational</p>
</div>
<div class="dbparams-valid" bind:this={paramsValidEl}>
	<p>Database Parameters and Credentials</p>
	<p>are walid and ready for installation</p>
</div>
<div class="cannot-remove-role" bind:this={dbDepondOnRoleEl}>
	<p>Database is owned by this role</p>
	<p>so role cannot be removed</p>
	<p>before all its objects are</p>
</div>
<div class="validate-dbparams" bind:this={validateDbParamsEl}>
	<p>All DB Params are specified</p>
	<p>Click 'Verify Params with Postgres'</p>
	<p>to see if that can be done and if not</p>
	<p>modify some Params and repeat</p>
</div>

<div class="db-params-block" class:progress-active={isInstalling}>
	<details bind:open={isOpen} style="position:relative;z-index:2;cursor:pointer;">
		<summary class="summary">Parameters for Creating Database </summary>
		<div class="dbname-block">
			{#each Object.entries(inputBoxes) as [k, v] (k)}
				<label>
					{v[0]}
					<input
						type={v[1]}
						bind:value={dbState.db[k]}
						bind:this={dbState.els[`${k}El`]}
						onblur={markEmptyDbParamFields}
						class:empty-field={emptyField(k)}
					/>
				</label>
			{/each}
			<div class="button-wrapper">
				{#if existingDbParts && !paramsAreValid}
					{@render shouldDeleteDbObjects()}
				{/if}

				<!-- <button
            class="toggle-status-button"
            disabled={!validationMessage}
            style="padding:6px 0.6rem;text-align:center;color:sienna;"
          >
            Toggle Status
          </button> -->
				<button
					bind:this={verifyDbParamsEl}
					onclick={verifyDbParamsWithPostgres}
					style="position:relative;margin:5px 0 0 0;width:98%;padding:6px 0.5rem;text-align:center;color:sienna"
				>
					Verify Params with Postgres
				</button>
			</div>
		</div>
	</details>

	<!-- {#if isInstalling || progressPercents}
      <div class="message-container">
        <p style="padding:0;margin:0;grid-column:span 3;">
          {progressPercents}% — {statusMessage}
          <progress value={progressPercents} max="100" style="width: 100%;"
          ></progress>
        </p>
      </div>
      {#key currentTask}
        <div class="current-task">
          <span class:green-spinner={!currentTask.includes(prismaInitialized)}></span>
          <p style="display:inline-block;" transition:fade={{ duration: 250 }}>
            <span style='color:var(--green-type)'>{currentTask} {progressMsg}</span>
          </p>
        </div>
      {/key}
    {/if} -->
</div>

<style lang="scss">
	.row-lines {
		@include border($padding: 0.5rem 1rem);
		max-height: 15rem;
		overflow-y: auto;
	}
	.page-info {
		@include page-info();
		margin-top: 1.5rem;
		z-index: 2027;
	}
	div,
	ul,
	p {
		background: var(--bg);
		color: var(--cr-text);
	}
	.message-container {
		margin: 5px auto;
		border: 1px solid blue;
		width: 90%;
		p {
			font-size: 14px;
			color: var(--candidate-color);
		}
		.progress {
			width: Z0%;
		}
	}
	.logs {
		margin-top: 20px;
		height: clamp(2rem, 5rem, 12rem);
		overflow-y: auto;
		background: #1e1e1e;
		padding: 10px;
		z-index: 4000;
	}
	pre {
		margin: 2px 0;
		font-size: 0.9em;
		white-space: pre-wrap;
		color: var(--pre-color);
		// color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}
	.stderr {
		color: #ff6666;
	}
	button {
		@include button();
	}
	.spinner,
	.green-spinner {
		display: inline-block;
		width: 1em;
		height: 1em;
		border: 3px solid #a1c1eb;
		border-top-color: #1b4891;
		border-radius: 50%;
		animation: spin 900ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.db-params-block {
		position: absolute;
		top: 0;
		left: 0;
		display: grid;
		grid-template-columns: 26rem 13.2rem 5rem;
		grid-auto-rows: 0.6rem;
		align-items: self-start;
		background-color: transparent;
		padding: 0;
		gap: 1rem;
		z-index: 50;
		display: none;
	}
	.db-params-block.progress-active {
		display: block;
	}
	.buttons-row {
		display: flex;
		flex: 1;
		// grid-template-columns: 16rem 4rem;
		// gap: 1rem;
		// position: absolute;
		// top: 24rem;
		// left: 5rem;
		.button-install {
			display: flex;
			display: inline-block;
			outline: none;
			// margin-left: 4rem;
			border: 1px solid gray;
			border-radius: 5px;
			padding: 3px 1rem;
			font-size: 14px !important;
			font-weight: 400;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: max-content;
			cursor: pointer;
			outline: 1px solid transparent;
			/*transition: color 0.4s ease;*/
			&:hover {
				outline: var(--candidate-color) solid 1px;
			}
		}

		.button-close {
			display: inline-block;
			outline: none;
			border: 1px solid gray;
			padding: 3px 1rem;
			border-radius: 5px;
			font-weight: 400;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: max-content;
			cursor: pointer;
		}
	}
	/*.toggle-status-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }*/
	.dependencies-label {
		display: inline-block;
		grid-column: span 3;
		margin-left: 0.5rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}
	.node-modules {
		@include progress-field();
	}
	.raw-lines {
		position: relative;
		width: 100%;
		@include progress-field();
	}
	.raw-lines {
		position: relative;
		width: 98%;
		border: 1px solid gray;
		border-radius: 3px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		font-size: 14px;
		font-weight: 600;
		padding: 4px 0 0 0.5rem;
		height: 1.5rem !important;
		overflow-y: auto;
		margin: 0 auto;
	}
	.progress-line {
		@include progress-field();
		display: none;
		height: 1.5rem;
	}
	.progress-line.progress-active {
		display: block;
	}
	.check-this {
		@include progress-field();
		:global(p) {
			color: var(--tomato-violet);
		}
	}
	.grid-container {
		/*position: absolute;
		top: 1.3rem;
		left: 0;*/
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-top: 4rem;
		width: 90%;
		margin: 0 auto;
		border: 1px solid green;
		.left-column {
			border: 1px solid red; //gray;
			border-radius: 8px;
			font-size: 14px;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: 100%;
		}

		.right-column {
			width: 100%;
			border: 1px solid blue;
			.dependencies-list {
				@include progress-field();
				height: clamp(2rem, 5rem, 10rem);
			}
		}
	}
	.progress-title {
		display: inline-block;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-title-color);
		font-weight: 600;
		width: 95%;
		& ~ p {
			padding-left: 0.5rem;
			font-weight: 400;
		}
	}
	.overflow-y {
		overflow-y: auto;
	}
	// .theme-container {
	//   height: 98vh;
	//   width: 98vw;
	//   // background-color: var(--bg);
	//   color: var(--text);
	//   margin: 0;
	//   padding: 0;
	//   transition: background 0.4s ease color 0.4s ease;
	// }
	.hidden {
		display: none;
	}

	// NOTE many css classes do not work so inline styles are often used
	.dbname-block {
		position: absolute;
		top: 2rem;
		left: 0;
		@include container($caption: 'Database Parameters');
		border: 1px solid gray;
		width: 19.4rem;
		padding: 0.5rem;
		border-radius: 6px;
		margin-top: 0.1rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);

		label {
			display: block;
			width: 10rem;
			padding: 0;
			margin: 0 1rem 6px 0;
			color: var(--candidate-color);
		}

		input {
			display: block;
			width: 18rem;
			height: 1.5rem !important;
			margin: 8px 1rem 10px 0;
			padding: 6px 0.5rem 8px 1rem;
			border-radius: 4px;
			outline: none;
		}
	}
	.summary {
		position: relative;
		/* list-style: none; */
		width: 19.5rem;
		border: 1px solid gray;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		border-radius: 6px;
		height: 1.6rem;
		padding-left: 0.5rem;
		line-height: 1.5rem;
		cursor: pointer;
		z-index: 1;
	}
	.details {
		position: relative;
		z-index: 1;
		border: 1px solid gray;
		width: 19rem;
		font-size: 13px;
		font-weight: 400;
		border-radius: 6px;
		padding: 0 0.5rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}
	.no-credentials,
	.dbparams-valid,
	.validate-dbparams,
	.cannot-remove-role {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none; // <-- Prevents invisible tooltip templates from stealing clicks!
		height: auto;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 13px;
		z-index: 3000;
		opacity: 0;
		pointer-events: none;
		p {
			color: inherit;
			background-color: inherit;
			padding: 3px 0;
			margin: 0;
		}
	}

	.no-credentials {
		@include container($caption: 'DB Credentials Incomplete');
	}

	.dbparams-valid {
		@include container($caption: 'Start with Installation');
	}

	.validate-dbparams {
		@include container($caption: 'Verify DB Parameters');
	}

	.cannot-remove-role {
		@include container($caption: 'Not Allowed', $caption-color: tomato);
	}

	// .disabled{
	//     opacity: 0.5;
	//     cursor: not-allowed;
	// }
	.button-wrapper {
		position: relative;
		// display: inline-block;
		.db-params-status {
			@include container(
				$caption: 'Delete Selected DB Objacts',
				$border: 2px solid gray,
				$padding: 0.5rem 1rem
			);
			position: absolute;
			left: 0;
			bottom: 100%;
			margin-bottom: 8px;
			font-size: 14px;
			// color: var(--candidate-color);
			// background-color: var(--candidate-bg-color);
			p,
			input,
			span {
				display: inline-block;
				padding: 0;
				margin: 0;
				color: var(--candidate-color);
			}
			// button {
			//   margin-left: 1rem;
			// }
		}
	}

	// .db-params-status{
	//   @include container($caption: 'Delete Selected DB Objects');
	//   position: absolute;
	//   left: 0;
	//   bottom: 100%; /* Align bottom edge of container to top edge of button */
	//   margin-bottom: 8px; /* Spacing above button */
	//   width: max-content;
	//   // padding: 0.5rem 1rem;
	//   font-size: 12px;
	//   white-space: nowrap;
	//   z-index: 10;
	//   p{
	//     padding:0 !important;
	//     margin:0 !important;
	//   }
	// }
	.current-task {
		grid-column: span 2;
		display: flex;
		align-items: center;
		color: var(--green-type);
		font-size: 13px;
		width: 90%;
		height: 1.5rem;
		margin: 0 auto;
		border: 2px solid red;
		span {
			margin-right: 7px;
		}
	}
	.empty-field {
		background-color: #f4cdcd;
	}
</style>
