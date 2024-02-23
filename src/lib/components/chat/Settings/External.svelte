<script lang="ts">
	import { getOpenAIKey, getOpenAIUrl, updateOpenAIKey, updateOpenAIUrl } from '$lib/apis/openai';
	import { models, user } from '$lib/stores';
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();

	export let getModels: Function;

	// External
	let OPENAI_API_KEY = '';
	let OPENAI_API_BASE_URL = '';

	// Azure OpenAI
	let AZURE_DEPLOYMENT_NAME = '';
	let AZURE_MODEL_NAME = '';
	let AZURE_OPENAI_VERSION = '';
	let SHOULD_USE_AZURE = false;

	const updateOpenAIHandler = async () => {
		OPENAI_API_BASE_URL = await updateOpenAIUrl(localStorage.token, OPENAI_API_BASE_URL);
		OPENAI_API_KEY = await updateOpenAIKey(localStorage.token, OPENAI_API_KEY);
		localStorage.setItem('use_azure', SHOULD_USE_AZURE.toString());
		localStorage.setItem('azure_openai_version', AZURE_OPENAI_VERSION);
		localStorage.setItem('azure_deployment_name', AZURE_DEPLOYMENT_NAME);
		localStorage.setItem('azure_model_name', AZURE_MODEL_NAME);

		await models.set(await getModels());
	};

	onMount(async () => {
		if ($user.role === 'admin') {
			OPENAI_API_BASE_URL = await getOpenAIUrl(localStorage.token);
			OPENAI_API_KEY = await getOpenAIKey(localStorage.token);

			AZURE_OPENAI_VERSION = localStorage.getItem('azure_openai_version') || '';
			console.log(localStorage.getItem('use_azure'));
			// should_use_azure should be true if in localstorage it says 'true' else false
			SHOULD_USE_AZURE = localStorage.getItem('use_azure') === 'true';
			// SHOULD_USE_AZURE = (localStorage.getItem('use_azure')) || false;
			console.log({ SHOULD_USE_AZURE });
			AZURE_DEPLOYMENT_NAME = localStorage.getItem('azure_deployment_name') || '';
			AZURE_MODEL_NAME = localStorage.getItem('azure_model_name') || '';
		}
	});

	const handleClick = (e) => {
		SHOULD_USE_AZURE = e.target.checked;
	};
</script>

<form
	class="flex flex-col h-full justify-between space-y-3 text-sm"
	on:submit|preventDefault={() => {
		updateOpenAIHandler();
		dispatch('save');

		// saveSettings({
		// 	OPENAI_API_KEY: OPENAI_API_KEY !== '' ? OPENAI_API_KEY : undefined,
		// 	OPENAI_API_BASE_URL: OPENAI_API_BASE_URL !== '' ? OPENAI_API_BASE_URL : undefined
		// });
	}}
>
	<div class=" space-y-3">
		<div>
			<div class=" mb-2.5 text-sm font-medium">OpenAI/Azure API Key</div>
			<div class="flex w-full">
				<div class="flex-1">
					<input
						class="w-full rounded py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-800 outline-none"
						placeholder="Enter OpenAI API Key"
						bind:value={OPENAI_API_KEY}
						autocomplete="off"
					/>
				</div>
			</div>
			<div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
				Adds optional support for online models.
			</div>
		</div>

		<hr class=" dark:border-gray-700" />

		<div>
			<div class=" mb-2.5 text-sm font-medium">OpenAI/Azure API Base URL</div>
			<div class="flex w-full">
				<div class="flex-1">
					<input
						class="w-full rounded py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-800 outline-none"
						placeholder="Enter OpenAI API Key"
						bind:value={OPENAI_API_BASE_URL}
						autocomplete="off"
					/>
				</div>
			</div>
			<div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
				WebUI will make requests to <span class=" text-gray-200">'{OPENAI_API_BASE_URL}/chat'</span>
			</div>
		</div>

		<div class="flex space-x-2 text-sm">
			<input
				type="checkbox"
				bind:checked={SHOULD_USE_AZURE}
				on:click={handleClick}
				id="azure-toggle"
			/>
			<label for="azure-toggle">Use Azure OpenAI</label>
		</div>

		{#if SHOULD_USE_AZURE}
			<div>
				<div class=" mb-2.5 text-sm font-medium">API Version</div>
				<div class="flex w-full">
					<div class="flex-1">
						<input
							class="w-full rounded py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-800 outline-none"
							placeholder="eg: 2023-05-15"
							bind:value={AZURE_OPENAI_VERSION}
							autocomplete="off"
							required
						/>
					</div>
				</div>
				<div class="mt-2 text-xs text-gray-400 dark:text-gray-500">Azure OpenAI API version</div>
			</div>

			<div class="flex w-full">
				<!-- Left column for Model Name -->
				<div class="flex-1 pr-2">
					<div class="mb-2.5 text-sm font-medium">Model Name (Optional)</div>
					<div class="flex w-full">
						<div class="flex-1">
							<input
								class="w-full rounded py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-800 outline-none"
								placeholder="Enter Model Name"
								bind:value={AZURE_MODEL_NAME}
								autocomplete="off"
							/>
						</div>
					</div>
				</div>

				<!-- Right column for Deployment Name -->
				<div class="flex-1 pl-2">
					<div class="mb-2.5 text-sm font-medium">Deployment Name</div>
					<div class="flex w-full">
						<div class="flex-1">
							<input
								class="w-full rounded py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-800 outline-none"
								placeholder="Enter Deployment Name"
								bind:value={AZURE_DEPLOYMENT_NAME}
								autocomplete="off"
								required
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-2 text-xs text-gray-400 dark:text-gray-500">eg: GPT 3.5 fine tuned</div>
		{/if}
	</div>

	<div class="flex justify-end pt-3 text-sm font-medium">
		<button
			class=" px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-gray-100 transition rounded"
			type="submit"
		>
			Save
		</button>
	</div>
</form>
