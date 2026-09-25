const KEY = 'openrouter_api_key';
const MODEL_KEY = 'openrouter_model';

export const DEFAULT_MODEL_ID = 'google/gemini-flash-1.5';

// Fetched dynamically from OpenRouter — only vision-capable models
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength?: number;
  pricePrompt?: number;   // price per million input tokens in USD
  isFree: boolean;
}

/**
 * Fetches all vision-capable models from OpenRouter API.
 * Filters for models whose modality includes image input.
 */
export async function fetchVisionModels(apiKey: string): Promise<AIModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`);
  }

  const json = await res.json();
  const allModels: any[] = json.data || [];

  // Filter: only models that accept image input
  const visionModels = allModels.filter((m: any) => {
    const modality: string = m.architecture?.modality || m.architecture?.input_modalities?.join('+') || '';
    return modality.toLowerCase().includes('image');
  });

  // Sort: free models first, then by name
  visionModels.sort((a: any, b: any) => {
    const aFree = parseFloat(a.pricing?.prompt || '1') === 0;
    const bFree = parseFloat(b.pricing?.prompt || '1') === 0;
    if (aFree && !bFree) return -1;
    if (!aFree && bFree) return 1;
    return (a.name || a.id).localeCompare(b.name || b.id);
  });

  return visionModels.map((m: any) => {
    const providerSlug = m.id.split('/')[0] || '';
    const provider = providerSlug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const pricePrompt = parseFloat(m.pricing?.prompt || '0');

    return {
      id: m.id,
      name: m.name || m.id,
      provider,
      description: m.description,
      contextLength: m.context_length,
      pricePrompt: pricePrompt * 1_000_000, // convert to per-million price
      isFree: pricePrompt === 0,
    } satisfies AIModel;
  });
}

export function getOpenRouterApiKey(): string {
  return localStorage.getItem(KEY) || import.meta.env.VITE_OPENROUTER_API_KEY || '';
}

export function saveOpenRouterApiKey(key: string): void {
  localStorage.setItem(KEY, key);
}

export function clearOpenRouterApiKey(): void {
  localStorage.removeItem(KEY);
}

export function getSelectedModelId(): string {
  return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL_ID;
}

export function saveSelectedModelId(modelId: string): void {
  localStorage.setItem(MODEL_KEY, modelId);
}
