<script lang="ts">
	import HoverableDetails from '$lib/components/HoverableDetails.svelte';
	let cbGroup = $state('');
	let logGroups = $state([
		{ id: 1, title: 'title 1', lines: ['line1', 'line2'], status: 'active', active: true },
		{ id: 2, title: 'title 2', lines: ['line2', 'line3'], status: 'running', active: true },
		{ id: 3, title: 'title 3', lines: ['line3', 'line4'], status: 'idle', active: true }
	]);
	// let mandatoryEntriesEl: HTMLDivElement;
	// let dbDepondOnRoleEl: HTMLDivElement;
	// let validateDbParams: HTMLDivElement;
	// let verifyDbParamsEl: HTMLButtonElement;
	// let isOpen = $state(true);
	let isInstalling = $state(false);
	let progressPercents = $state(34);
	let currentTask = 'current task: Installing PNPM Packages';
	let statusMessage = 'statusMessage';
	let progressMsg = 'statusMessage';
	let prismaInitialized = 'prismaInitialized';
	let progressCollector = $state<Record<string, string[]>>({});
	progressCollector['m[0]'] = [];
	// progressCollector['m[0]'].push('progressMsg one');
	// progressCollector['m[1]'].push('progressMsg two');
	let isActive = $state(false);
	let isAboutActive = $state(false);
	const sixHash = () => {
		const a = (Math.random() * 46656) | 0;
		const b = (Math.random() * 46656) | 0;
		return a.toString(36).slice(-3) + b.toString(36).slice(-3);
	};
	const inputBoxes = {
		name: ['Database Name', 'text'],
		owner: ['Database Owner', 'text'],
		password: ["Owner's Password", 'password'],
		host: ['Host Name', 'text'],
		port: ['Communication Port', 'number'],
		adminName: ['Database Role (Admin Name)', 'text'],
		adminPwd: ['Database Role Password', 'password']
	};
	let arrDBParamsStatus = ['role rony exists', 'database dbrony exists'];
	// function dropSelected() {
	// 	log('dropSelected');
	// }
</script>

<button
	onclick={(e: MouseEvent) => {
		e.preventDefault();
		isAboutActive = !isAboutActive;
	}}>toggle About Page</button
>
<button
	onclick={(e: MouseEvent) => {
		e.preventDefault();
		isInstalling = !isInstalling;
	}}>toggle is installing</button
>
<div class="log-container">
	{#each logGroups as group (group.id)}
		<details open={true} class="log-group {group.status}" class:is-active={group.active}>
			<summary class="log-summary">
				<span class="status-indicator"></span>
				<span class="group-title">{group.title}</span>
				<span class="line-count">({group.lines.length} lines)</span>
			</summary>

			<div class="log-content">
				{#each group.lines as line}
					<div class="log-line">{line}</div>
				{/each}
			</div>
		</details>
	{/each}
</div>
<!-- Gemini end -->
<div class="mandatory-entries" style="opacity:0;">
	<p>Without Credentials for Managing DB</p>
	<p>Role and DB cannot be created and</p>
	<p>Prisma ORM will be left inoperational</p>
</div>
<div class="cannot-remove-role" style="opacity:0;">
	<p>Database is owned by this role</p>
	<p>so role cannot be removed</p>
	<p>before all its objects are</p>
</div>
<div class="mandatory-entries" style="opacity:0;">
	<p>All DB Params are specified</p>
	<p>Click 'Verify Params with Postgres'</p>
	<p>to see if that can be done and if not</p>
	<p>modify some Params and repeat</p>
</div>
<!-- <CRReactiveTooltip bind:this={tt} onClose={tooltipOnClose}/> -->
{#snippet pagePurpose()}
	<pre>
    
This page is shown as the Prisma ORM is not installed in this app.
You can proceed with the installation or close the extension and
do the installation yourself.

<span>In the screen First Part</span>

When clicking 'Create database' summary button it opens a panel
for getting the following parameters
  - database name
  - role name as a database owner
  - role's password for connecting and handling database
  - optional server name (default is localhost)
  - optional communication port (default is 5432)

<span>In the screen Second Part</span> 

The 'Install Prisma & Dependencies' button starts the process for
installing Prisma ORM, creating database with given parameters and 
installing the other necessary software packages utilizing current
Package Manager e.g. pnpm.

  </pre>
{/snippet}

{#if isAboutActive}
	<div class="page-info" style="position:absolute;top:1.5rem;left:0;z-index:200;">
		{@render pagePurpose()}
	</div>
{/if}

{#snippet shouldDeleteDbObjects()}
	<div class="db-params-status">
		{#each arrDBParamsStatus as line (sixHash())}
			{@const part = line.split(/\s+/)[0].trim() || ''}
			{#if line.includes('already exists')}
				<label for={part} style="padding:0;margin:0;cursor:pointer;">
					<input
						id={part}
						type="checkbox"
						value={part}
						name="cbGroup"
						disabled={part === 'Role' && !cbGroup.includes('Database')}
						style="display:inline-block;padding:0;margin:0;"
						bind:group={cbGroup}
					/>
					<p style="display:inine-block;padding:0;margin:0;">{line}</p>
				</label>
			{/if}
			<!-- <br /> -->
		{/each}
		<button
			style:color={cbGroup.length === 0 ? 'gray' : 'skyblue'}
			style="margin-left:8rem;"
			disabled={cbGroup.length === 0}
		>
			drop selected
		</button>
	</div>
{/snippet}

<div class="db-params-block">
	<details bind:open={isActive} style="position:relative;z-index:2;cursor:pointer;">
		<summary class="summary">Parameters for Creating Database </summary>
		<div
			class="dbname-block"
			style="border: 1px solid gray;width:19.4rem;padding:0.5rem;
			border-radius: 6px;margin-top:0.1rem;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);"
		>
			{#each Object.entries(inputBoxes) as [k, v] (k)}
				<label>
					{v[0]}
					<input type={v[1]} />
				</label>
			{/each}
			<div class="button-wrapper">
				<!-- {#if existingDbParts && !paramsAreValid}
					{@render shouldDeleteDbObjects()}
				{/if} -->

				<button
					class="toggle-status-button"
					disabled={false}
					style="padding:6px 0.6rem;text-align:center;color:sienna;"
				>
					Toggle Status
				</button>
				<button
					style="position:relative;margin-left:3px;padding:6px 0.5rem;text-align:center;color:sienna"
				>
					Verify Params with Postgres
				</button>
			</div>
		</div>
	</details>
</div>
{#if isInstalling || progressPercents}
	<div class="message-container">
		<p style="padding:0;margin:0;grid-column:span 3;">
			{progressPercents}% — {statusMessage}
			<progress value={progressPercents} max="100" style="width: 100%;"></progress>
		</p>
	</div>
	{#key currentTask}
		<div class="current-task">
			<span class:green-spinner={!currentTask.includes(prismaInitialized)}></span>
			<p style="display:inline-block;" transition:fade={{ duration: 250 }}>
				<span style="color:var(--green-type)">{currentTask} {progressMsg}</span>
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
		<div class="progress-line">
			<span class="progress-title" style="margin-left:0.5rem;width:93.3%;">Progress</span>
			<!-- <p bind:this={progressLineEl}></p> -->
		</div>
		{#each Object.entries(progressCollector) as [summary, details]}
			<HoverableDetails {summary} {details} />
		{/each}
	</div>
	<div class="buttons-row">
		<button
			cLass="button-install"
			// onclick={startPrismaInstall}
			// onmouseenter={showMandatoryEntries}
			// onmouseleave={showMandatoryEntries}
			// disabled={dbParamsMissing}
		>
			<span class:spinner={isActive}></span>
			Start Installation
		</button>
		<button class="button-close">close</button>
	</div>
</div>

<!-- {#if approvalPackages.length > 0} -->
<div class="approval-section">
	<p>
		<strong>Some packages require approval to run build scripts:</strong>
	</p>
	<ul>
		{#each ['pkg1', 'pkg2'] as pkg (pkg)}
			<li>
				<button>{pkg}</button>
			</li>
		{/each}
	</ul>
	<button>Approve All</button>
</div>

<!-- {/if} -->

<style lang="scss">
	/* Gemini start*/
	.log-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-family: var(--vscode-editor-font-family, monospace);
		font-size: 12px;
		margin-top: 8rem;
	}

	.log-group {
		border: 1px solid var(--vscode-widget-border, #454545);
		border-radius: 4px;
		background-color: cornsilk; /*var(--vscode-editor-background, #1e1e1e);*/
		transition:
			opacity 0.3s ease,
			border-color 0.3s ease;
		opacity: 0.7;
		width: 100%;
	}

	.log-group.is-active {
		opacity: 1;
		border-color: var(--vscode-focusBorder, #007acc);
		width: 100%;
	}

	.log-summary {
		cursor: pointer;
		padding: 6px 10px;
		font-weight: 600;
		user-select: none;
		display: flex;
		align-items: center;
		gap: 8px;
		background: cornsilk; /*var(--vscode-sideBar-background, #252526);*/
		width: 100%;
	}

	.group-title {
		flex-grow: 1;
	}

	.line-count {
		font-size: 10px;
		opacity: 0.6;
	}

	.log-content {
		padding: 8px 12px;
		height: clump(3rem, 5rem, 15rem);
		overflow-y: auto;
		background: aliceblue; /*var(--vscode-terminal-background, #000);*/
	}

	.log-line {
		white-space: pre-wrap;
		word-break: break-all;
		line-height: 1.4;
		color: var(--vscode-terminal-foreground, #cccccc);
	}
	/*
  a parent-child relationship. .status-indicator is found inside .log-group.success
  div class="log-group.success">
      div class=".status-indicator">/div>
  /div>
  log-group.success -- one element with multiple classes
  div class="log-group success">/div>
  in our case class="log-group {group.status}" where group.status==='success'
*/
	.log-group.success .status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #4ec9b0;
	}

	.log-group.error .status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #f14c4c;
	}

	.log-group.running .status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #cca700;
	}
	/* Gemini end*/
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
		margin: 0 0 8px 1rem;
		grid-column: span 3;
		width: 39rem;
		p {
			font-size: 14px;
			color: var(--candidate-color);
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
		top: 3rem;
		left: 0;
		display: grid;
		grid-template-columns: 26rem 13.2rem 5rem;
		grid-auto-rows: 0.6rem;
		align-items: self-start;
		background-color: transparent;
		padding: 0;
		gap: 1rem;
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
			margin-left: 10rem;
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
	.toggle-status-button:disabled {
		cursor: not-allowed;
		opacity: 0.6; /* Optional visual feedback for disabled state */
	}
	.dependencies-label {
		display: inline-block;
		grid-column: span 3;
		margin: 10px 0 0 0.5rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		width: 100%;
	}
	.node-modules {
		@include progress-field();
	}
	.raw-lines {
		position: relative;
		@include progress-field();
	}
	.other-progress-lines {
		@include progress-field();
		width: 100%;
	}
	.check-this {
		@include progress-field();
		:global(p) {
			color: var(--tomato-violet);
		}
	}
	.grid-container {
		position: absolute;
		top: 1.3rem;
		left: 0;
		display: grid;
		grid-template-columns: repeat(2, 40vw);
		gap: 1rem;
		margin-top: 12rem;
		border: 3px solid red;
		.left-column {
			border: 4px solid green;
			border-radius: 8px;
			font-size: 14px;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: 100%;
			margin: 0 0 0.5rem;
		}
		// .left_column {
		// 	.progress-line {
		// 		@include progress-field();
		// 		margin-top: 0.5rem;
		// 		color: red;
		// 	}
		// }
		.right-column {
			width: 39vw;
			border: 2px solid red;
			.dependencies-list {
				@include progress-field();
				height: clamp(2rem, 5rem, 10rem);
			}
			// .dev-dependencies-list {
			//   @include progress-field();
			//   height: clamp(2rem, 4rem, 6rem);
			// }
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
			margin: 0;
			padding: 1rem;
			label {
				width: 10rem;
				padding: 0;
				margin: 0 1rem 6px 0;
				color: var(--candidate-color);
			}

			input[type='text'],
			input[type='number'] {
				display: block;
				width: 18rem;
				height: 1.5rem !important;
				margin: 8px 0 10px 0;
				padding: 6px 1rem 8px 1rem;
				border-radius: 4px;
				outline: none;
			}
		}
	}
	input,
	label {
		display: block;
		// height: 1rem !important;
		// margin-bottom: 10px;
	}
	.summary {
		position: relative;
		/* list-style: none; */
		width: 100%;
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
	.mandatory-entries,
	.cannot-remove-role {
		position: absolute;
		top: 0;
		left: 0;
		@include container($caption: 'Database Params');
		height: auto;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 13px;
		z-index: 3000;
		p {
			color: inherit;
			background-color: inherit;
			padding: 3px 0;
			margin: 0;
		}
	}
	.cannot-remove-role {
		@include container(
			$caption: 'Not Allowed',
			$caption-color: tomato,
			$caption-background-color: cornsilk
		);
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

	.db-params-status {
		@include container($caption: 'Delete Selected DB Objects');
		position: absolute;
		left: 0;
		bottom: 100%; /* Align bottom edge of container to top edge of button */
		margin-bottom: 8px; /* Spacing above button */
		width: max-content;
		// padding: 0.5rem 1rem;
		font-size: 12px;
		white-space: nowrap;
		z-index: 10;
		p {
			padding: 0 !important;
			margin: 0 !important;
		}
	}
	.current-task {
		grid-column: span 3;
		display: flex;
		align-items: center;
		color: var(--green-type);
		font-size: 13px;
		margin-left: 1rem;
		span {
			margin-right: 7px;
		}
	}
	.approval-section {
		border: 4px solid blue;
	}
</style>
