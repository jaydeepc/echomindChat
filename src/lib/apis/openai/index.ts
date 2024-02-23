import { OPENAI_API_BASE_URL } from '$lib/constants';

export const getOpenAIUrl = async (token: string = '') => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/url`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.OPENAI_API_BASE_URL;
};

export const updateOpenAIUrl = async (token: string = '', url: string) => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/url/update`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			url: url
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.OPENAI_API_BASE_URL;
};

export const getOpenAIKey = async (token: string = '') => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/key`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.OPENAI_API_KEY;
};

export const updateOpenAIKey = async (token: string = '', key: string) => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/key/update`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			key: key
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.OPENAI_API_KEY;
};

export const getOpenAIModels = async (token: string = '') => {
	let error = null;

	const shouldUseAzure = localStorage.getItem('use_azure') === 'true';
	const azureModels = JSON.parse(localStorage.getItem('azure_models') || '[]');
	let res = [];

	if (shouldUseAzure) {
		console.log('using azure');
		res = { data: azureModels };
	} else {
		res = await fetch(`${OPENAI_API_BASE_URL}/models`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...(token && { authorization: `Bearer ${token}` })
			}
		})
			.then(async (res) => {
				if (!res.ok) throw await res.json();
				const data = await res.json();
				return data;
			})
			.catch((err) => {
				console.log(err);
				error = `OpenAI: ${err?.error?.message ?? 'Network Problem'}`;
				return [];
			});
	}

	if (error) {
		throw error;
	}

	const models = Array.isArray(res) ? res : res?.data ?? null;

	return models
		? models
			.map((model) => ({ name: model.id, external: true }))
			.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})
		: models;
};

export const getOpenAIModelsDirect = async (
	base_url: string = 'https://api.openai.com/v1',
	api_key: string = ''
) => {
	let error = null;

	const res = await fetch(`${base_url}/models`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${api_key}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = `OpenAI: ${err?.error?.message ?? 'Network Problem'}`;
			return null;
		});

	if (error) {
		throw error;
	}

	const models = Array.isArray(res) ? res : res?.data ?? null;

	return models
		.map((model) => ({ name: model.id, external: true }))
		.filter((model) => (base_url.includes('openai') ? model.name.includes('gpt') : true))
		.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
};

export const generateOpenAIChatCompletion = async (token: string = '', body: object) => {
	let error = null;
	let API_URL = `${OPENAI_API_BASE_URL}/chat/completions`;
	const shouldUseAzure = localStorage.getItem('use_azure') === 'true';
	let headers = {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json'
	};
	if (shouldUseAzure) {
		console.log('using azure');
		const azure_openai_api_key = localStorage.getItem('azure_openai_api_key');
		const OPENAI_AZURE_ENDPOINT = localStorage.getItem('openai_azure_endpoint');
		const azure_openai_version = localStorage.getItem('azure_openai_version');
		const azure_models = JSON.parse(localStorage.getItem('azure_models') || '[]');

		if (
			!azure_openai_api_key ||
			!OPENAI_AZURE_ENDPOINT ||
			!azure_openai_version ||
			!azure_models?.length
		) {
			console.error('Error: Azure openaiapikey, endpoint, version or models not found');
			return;
		}
		const { deployment_name } = azure_models[0];
		API_URL = `${OPENAI_AZURE_ENDPOINT}/openai/deployments/${deployment_name}/chat/completions?api-version=${azure_openai_version}`;

		headers = {
			'Content-Type': 'application/json',
			'api-key': azure_openai_api_key
		};
	}

	const res = await fetch(`${API_URL}`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	}).catch((err) => {
		console.log(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return res;
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = ''
) => {
	let error = null;

	const res = await fetch(`${OPENAI_API_BASE_URL}/audio/speech`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'tts-1',
			input: text,
			voice: speaker
		})
	}).catch((err) => {
		console.log(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return res;
};
