import { Category } from '../types';
import { getSelectedModelId } from '../utils/apiKey';

export interface AIScanResult {
  name: string;
  brand?: string;
  modelNumber?: string;
  categoryName: string;
  categoryIcon: string;
  isNewCategory: boolean;
  subcategoryName?: string;
  isNewSubcategory: boolean;
  condition: 'Mint / New' | 'Like New' | 'Good' | 'Fair' | 'Parts Only';
  tags: string[];
  notes?: string;
  quantity?: number;
}

const AVAILABLE_ICONS = [
  'Cpu', 'Boxes', 'Bot', 'Wrench', 'Cog', 'BookOpen', 'Gamepad2', 'Nut',
  'Grid', 'Package', 'Layers', 'Radio', 'Tv', 'Camera', 'Shirt', 'Disc',
  'Glasses', 'Zap', 'Hammer', 'Palette', 'Laptop', 'Folder', 'Archive', 'Compass',
];

const CONDITION_OPTIONS = ['Mint / New', 'Like New', 'Good', 'Fair', 'Parts Only'];

/**
 * Converts a base64 data URL or raw base64 string to a format suitable for the OpenRouter API.
 */
function extractBase64(imageData: string): { base64: string; mimeType: string } {
  if (imageData.startsWith('data:')) {
    const [header, data] = imageData.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    return { base64: data, mimeType };
  }
  // SVG data URIs
  if (imageData.startsWith('data:image/svg')) {
    return { base64: btoa(decodeURIComponent(imageData.split(',')[1] || '')), mimeType: 'image/svg+xml' };
  }
  return { base64: imageData, mimeType: 'image/jpeg' };
}

/**
 * Uses an OpenRouter vision model to analyze an item photo and return structured metadata.
 * @param imageDataUrl - A base64 data URL of the image
 * @param existingCategories - The user's existing categories so the AI can match them
 * @param apiKey - The OpenRouter API key
 */
export async function scanItemWithAI(
  imageDataUrl: string,
  existingCategories: Category[],
  apiKey: string
): Promise<AIScanResult> {
  const topLevelCats = existingCategories.filter((c) => !c.parentId);
  const categoryListStr = topLevelCats.map((c) => `- "${c.name}" (icon: ${c.icon})`).join('\n');

  const systemPrompt = `You are an AI assistant that analyzes photos of physical items for an inventory app.
You must respond with ONLY a valid JSON object and nothing else — no markdown, no code fences, no explanation.

The user has these existing categories (prefer matching one of these):
${categoryListStr || '(no categories yet)'}

Available icons for new categories (pick the best one):
${AVAILABLE_ICONS.join(', ')}

Valid condition values: ${CONDITION_OPTIONS.join(', ')}

Analyze the image and return this JSON structure:
{
  "name": "specific item name (e.g. 'Arduino Mega 2560' not just 'Arduino')",
  "brand": "manufacturer/brand or null",
  "modelNumber": "model/part number or null",
  "categoryName": "MUST match an existing category name exactly if it fits, or a new name if truly needed",
  "categoryIcon": "one icon from the available list",
  "isNewCategory": false (true only if none of the existing categories fit),
  "subcategoryName": "specific subcategory e.g. 'Microcontrollers', 'Sensors', 'DC Motors' or null",
  "isNewSubcategory": false (true if this subcategory doesn't exist yet),
  "condition": "one of the valid condition values",
  "tags": ["up to 5 relevant tags in lowercase"],
  "notes": "one useful note about this item: specs, use case, or storage tip — or null",
  "quantity": 1
}`;

  const { base64, mimeType } = extractBase64(imageDataUrl);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://local-inventory-app',
      'X-Title': 'Local Inventory',
    },
    body: JSON.stringify({
      model: getSelectedModelId(),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  // Strip markdown code fences if model includes them anyway
  const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: AIScanResult;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${cleanedContent}`);
  }

  // Validate and sanitise
  if (!parsed.name) throw new Error('AI did not return an item name');
  if (!CONDITION_OPTIONS.includes(parsed.condition)) parsed.condition = 'Mint / New';
  if (!Array.isArray(parsed.tags)) parsed.tags = [];
  parsed.quantity = parsed.quantity ?? 1;

  return parsed;
}
