const KEY = 'openrouter_api_key';

export function getOpenRouterApiKey(): string {
  return localStorage.getItem(KEY) || import.meta.env.VITE_OPENROUTER_API_KEY || '';
}

export function saveOpenRouterApiKey(key: string): void {
  localStorage.setItem(KEY, key);
}

export function clearOpenRouterApiKey(): void {
  localStorage.removeItem(KEY);
}
