/**
 * Typed wrapper around the Freepik API.
 *
 * Supports two use-cases:
 *  1. AI image generation via Mystic (async task with polling)
 *  2. Stock resource search (sync)
 *
 * Docs: https://docs.freepik.com/api-reference/introduction
 * Auth: x-freepik-api-key header
 */

const FREEPIK_BASE = 'https://api.freepik.com/v1';

function getApiKey(): string {
  const key = process.env.FREEPIK_API_KEY;
  if (!key) {
    throw new Error('FREEPIK_API_KEY niet ingesteld in env.');
  }
  return key;
}

function headers(): Record<string, string> {
  return {
    'x-freepik-api-key': getApiKey(),
    'Content-Type': 'application/json',
  };
}

// ─── AI Generation (Mystic) ─────────────────────────────────────────

export type MysticResolution = '1k' | '2k' | '4k';
export type MysticAspectRatio =
  | 'square_1_1'
  | 'classic_4_3'
  | 'traditional_3_4'
  | 'widescreen_16_9'
  | 'social_story_9_16';

export interface MysticGenerateParams {
  prompt: string;
  resolution?: MysticResolution;
  aspectRatio?: MysticAspectRatio;
  model?: 'realism' | 'fluid' | 'zen';
  creativeDetailing?: number; // 0-50
  engine?: 'automatic' | 'magnific_illusio' | 'magnific_sharpy' | 'magnific_sparkle';
}

export interface MysticTaskResponse {
  data: {
    task_id: string;
    status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    generated?: string[]; // URLs when COMPLETED
  };
}

/**
 * Start a Mystic generation task. Returns task_id; poll with getMysticTask.
 */
export async function createMysticTask(
  params: MysticGenerateParams,
): Promise<MysticTaskResponse> {
  const body = {
    prompt: params.prompt,
    resolution: params.resolution ?? '2k',
    aspect_ratio: params.aspectRatio ?? 'widescreen_16_9',
    model: params.model ?? 'fluid',
    creative_detailing: params.creativeDetailing ?? 33,
    engine: params.engine ?? 'automatic',
  };

  const res = await fetch(`${FREEPIK_BASE}/ai/mystic`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Freepik Mystic create failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getMysticTask(taskId: string): Promise<MysticTaskResponse> {
  const res = await fetch(`${FREEPIK_BASE}/ai/mystic/${taskId}`, {
    method: 'GET',
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Freepik Mystic get failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Poll a Mystic task until COMPLETED, FAILED, or timeout. Returns the first
 * generated image URL on success.
 */
export async function waitForMysticTask(
  taskId: string,
  options: { maxWaitMs?: number; pollIntervalMs?: number } = {},
): Promise<string | null> {
  const maxWaitMs = options.maxWaitMs ?? 90_000;
  const pollIntervalMs = options.pollIntervalMs ?? 3_000;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const res = await getMysticTask(taskId);
    const { status, generated } = res.data;

    if (status === 'COMPLETED' && generated && generated.length > 0) {
      return generated[0];
    }
    if (status === 'FAILED') {
      throw new Error(`Freepik Mystic task ${taskId} failed`);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  return null;
}

// ─── Stock search ───────────────────────────────────────────────────

export interface FreepikResource {
  id: number;
  title: string;
  image: {
    source: { url: string };
  };
  licenses: { type: string; url: string }[];
}

export interface FreepikSearchResponse {
  data: FreepikResource[];
  meta: { pagination: { total: number } };
}

export interface StockSearchParams {
  query: string;
  limit?: number; // default 10, max 100
  orientation?: 'landscape' | 'portrait' | 'square';
  contentType?: 'photo' | 'vector' | 'psd';
}

export async function searchFreepikStock(
  params: StockSearchParams,
): Promise<FreepikSearchResponse> {
  const url = new URL(`${FREEPIK_BASE}/resources`);
  url.searchParams.set('term', params.query);
  url.searchParams.set('limit', String(params.limit ?? 10));
  if (params.orientation) {
    url.searchParams.set(`filters[orientation][${params.orientation}]`, '1');
  }
  if (params.contentType) {
    url.searchParams.set(`filters[content_type][${params.contentType}]`, '1');
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Freepik stock search failed (${res.status}): ${text}`);
  }

  return res.json();
}
