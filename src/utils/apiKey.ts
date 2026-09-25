const KEY = 'openrouter_api_key';
const MODEL_KEY = 'openrouter_model';

// ── Curated list of vision-capable models that work well for inventory scanning ──
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: 'Free' | 'Fast' | 'Best' | 'Smart';
  description: string;
}

export const VISION_MODELS: AIModel[] = [
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    badge: 'Free',
    description: 'Fast, free, great for everyday scanning',
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    badge: 'Fast',
    description: 'Latest Google flash model, very accurate',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    badge: 'Best',
    description: 'Most accurate, slower — great for complex items',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    badge: 'Fast',
    description: 'Very reliable, fast & affordable',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    badge: 'Smart',
    description: 'OpenAI\'s top model, excellent for obscure items',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    badge: 'Fast',
    description: 'Quick & concise responses from Anthropic',
  },
  {
    id: 'anthropic/claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    badge: 'Smart',
    description: 'Excellent reasoning, great detail extraction',
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    badge: 'Free',
    description: 'Open source, free, solid vision performance',
  },
];

export const DEFAULT_MODEL_ID = 'google/gemini-2.0-flash-001';

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
