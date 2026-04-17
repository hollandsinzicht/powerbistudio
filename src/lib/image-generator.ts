/**
 * Unified image generator for Power BI Studio.
 *
 * Pipeline:
 *  1. Claude schrijft een specifieke scene-omschrijving (hergebruik van
 *     de proven aanpak uit blog-image-generator.ts).
 *  2. Freepik Mystic genereert een AI-illustratie in de studio-stijl.
 *  3. Faalt Mystic of levert te generiek resultaat? → Freepik stock-search
 *     als fallback.
 *  4. Resultaat wordt gedownload en geupload naar Supabase storage.
 *
 * Gebruikt door:
 *  - Blog image generation (header images, OG)
 *  - Team avatars (square, niet-menselijke glyph-stijl)
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  createMysticTask,
  waitForMysticTask,
  searchFreepikStock,
  type MysticAspectRatio,
} from './freepik-client';
import { supabase } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Categorie → kleur hint voor illustraties (behouden uit legacy)
const CATEGORY_COLOR_HINTS: Record<string, string> = {
  'power-bi': 'navy blue and warm gold accents',
  'dax-datamodellering': 'navy blue and warm gold accents',
  'data-platform': 'warm orange and coral tones with cream background',
  'fabric-migratie': 'warm orange and coral tones with cream background',
  'governance-avg': 'deep teal and forest green tones',
  'embedded-analytics': 'deep purple and lavender tones',
  'procesverbetering-bi': 'warm gold and bronze tones',
  strategie: 'navy blue and warm gold accents',
};

const DEFAULT_COLORS = 'navy blue and warm gold accents';

// ─── Scene-description (Claude) ─────────────────────────────────────

export async function generateSceneDescription(
  title: string,
  excerpt: string,
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `A visual concept representing: ${title}`;
  }
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: `Je bent een art director voor blog header illustraties. Op basis van een blog titel en samenvatting bedenk je EEN specifieke, concrete visuele scene die het kernconcept van het artikel weergeeft.

REGELS:
- Beschrijf 1 specifieke scene in 2-4 zinnen, in het Engels
- Gebruik concrete visuele metaforen die bij het ONDERWERP passen — niet generiek
- Mention specific objects, charts, data visualizations, abstract shapes that represent the topic
- GEEN generieke elementen zoals: windmolens, mensen aan een laptop, kantoren, AI robots, tulpen
- WEL: schematische visualisaties van het concept (bv. voor "Fabric migratie": koppelingen tussen oude en nieuwe systemen)
- Geen tekst in de scene
- Eén centraal visueel idee, geen overvolle scene
- Antwoord ALLEEN met de scene-beschrijving, geen uitleg eromheen`,
      messages: [
        {
          role: 'user',
          content: `Blog titel: "${title}"\n\nBlog samenvatting: "${excerpt}"\n\nBeschrijf de visuele scene voor de header illustratie.`,
        },
      ],
    });
    const text = response.content[0];
    if (text.type === 'text') return text.text.trim();
    return `A visual concept representing: ${title}`;
  } catch (err) {
    console.error('Scene description generation failed:', err);
    return `A visual concept representing: ${title}`;
  }
}

// ─── Style prompt builders ──────────────────────────────────────────

function buildBlogPrompt(scene: string, colorHint: string): string {
  return `${scene}

Visual style requirements (apply consistently):
- Modern flat vector illustration in soft cartoon style
- Color palette: ${colorHint}, on a soft cream/off-white background
- Rounded shapes, gentle gradients, soft drop shadows
- Clean lines, professional but warm and approachable
- Similar to illustrations from Stripe, Notion, Figma, or Slack marketing pages
- NO text, NO letters, NO words in the image
- NO real people faces — only abstract figures or none at all
- NO windmills, NO tulips, NO traditional Dutch elements
- Centered composition with breathing room
- Wide landscape format optimized for blog header / OG image
- High quality vector art style`;
}

export interface TeamAvatarPromptParams {
  /** Volledige character-omschrijving incl. kleur en prop (e.g. "a purple chubby robot holding a magnifying glass") */
  subject: string;
  /** Legacy — wordt niet meer gebruikt (achtergrond is nu altijd wit) */
  gradient?: string;
}

function buildTeamAvatarPrompt(p: TeamAvatarPromptParams): string {
  return `A 3D rendered claymorphic mascot robot character: ${p.subject}.

Style reference: the cute 3D "icon style" popularized by TrySoro, Icons8 3D, Linear.app, Coinbase 3D illustrations, Framer, and Spline. Soft, rounded, chubby claymorphic forms with a matte plastic/clay material finish. Soft studio lighting creates gentle highlights and a subtle soft drop shadow beneath the character to ground it.

Character anatomy:
- Head: a simple rounded cube or small TV-screen-shape, with a screen face showing only two small dot or pill-shaped eyes (light / glowing). NO mouth, NO nose, NO human features.
- Body: soft rounded chubby shape with small simple arms. The character is cute and approachable, slightly toy-like.
- Material: matte plastic / clay, NOT metallic, NOT shiny sci-fi.

Background: clean pure white or very light cream (#FFFFFF to #F8F9FC) — NO gradient, NO texture, NO circuit lines. Just the character with a subtle soft shadow underneath.

Composition: character centered, three-quarter front-facing view, full body visible (with the key prop clearly shown). Square format. High-quality 3D render.

Hard rules:
- NO text, NO letters, NO words, NO numbers anywhere in the image
- NO human faces, NO human skin, NO human hands — ROBOT character only
- Only 2 simple dot eyes on the face, no other facial features
- Cute, rounded, claymorphic — NEVER sci-fi/industrial/dark
- White/neutral background, NO gradient background, NO circuit textures
- Single centered character, nothing cut off at the edges`;
}

// ─── Storage ────────────────────────────────────────────────────────

async function uploadToSupabase(
  bucket: string,
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    });
  if (error) {
    console.error(`Upload failed for ${bucket}/${fileName}:`, error.message);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

async function fetchAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  } catch (err) {
    console.error('fetchAsBuffer failed:', err);
    return null;
  }
}

// ─── Public API: blog image ─────────────────────────────────────────

export interface GenerateBlogImageParams {
  title: string;
  slug: string;
  excerpt: string;
  categorySlug?: string;
}

/**
 * Generates a blog header image via Freepik Mystic. Falls back to stock
 * search if Mystic fails. Returns a public Supabase URL or null.
 */
export async function generateBlogImage(
  params: GenerateBlogImageParams,
): Promise<string | null> {
  if (!process.env.FREEPIK_API_KEY) {
    console.error('FREEPIK_API_KEY niet ingesteld — image generation overgeslagen');
    return null;
  }

  const scene = await generateSceneDescription(params.title, params.excerpt);
  const colorHint =
    (params.categorySlug && CATEGORY_COLOR_HINTS[params.categorySlug]) ||
    DEFAULT_COLORS;
  const prompt = buildBlogPrompt(scene, colorHint);

  // 1. Try Mystic AI
  try {
    const task = await createMysticTask({
      prompt,
      aspectRatio: 'widescreen_16_9' as MysticAspectRatio,
      resolution: '2k',
      model: 'fluid',
    });
    const imageUrl = await waitForMysticTask(task.data.task_id);
    if (imageUrl) {
      const buf = await fetchAsBuffer(imageUrl);
      if (buf) {
        const fileName = `blog/${params.slug}-${Date.now()}.png`;
        const uploaded = await uploadToSupabase(
          'blog-images',
          fileName,
          buf,
          'image/png',
        );
        if (uploaded) return uploaded;
      }
    }
  } catch (err) {
    console.error('Freepik Mystic failed, falling back to stock:', err);
  }

  // 2. Fallback: stock search
  try {
    const query = extractKeywords(params.title, scene);
    const stock = await searchFreepikStock({
      query,
      limit: 5,
      orientation: 'landscape',
      contentType: 'vector',
    });
    const first = stock.data[0];
    if (first) {
      const buf = await fetchAsBuffer(first.image.source.url);
      if (buf) {
        const fileName = `blog/${params.slug}-stock-${Date.now()}.jpg`;
        return await uploadToSupabase(
          'blog-images',
          fileName,
          buf,
          'image/jpeg',
        );
      }
    }
  } catch (err) {
    console.error('Freepik stock fallback also failed:', err);
  }

  return null;
}

// ─── Public API: team avatar ────────────────────────────────────────

export interface GenerateTeamAvatarParams {
  agentId: string; // "ada" | "lex"
  subject: string; // glyph-omschrijving
  gradient: string; // kleur-gradient-omschrijving
}

/**
 * Generates a team avatar image via Freepik Mystic and saves it to
 * public/team/{agentId}.png on local disk (NOT Supabase, because avatars
 * are static assets bundled with the site).
 */
export async function generateTeamAvatar(
  params: GenerateTeamAvatarParams,
): Promise<Buffer | null> {
  if (!process.env.FREEPIK_API_KEY) {
    console.error('FREEPIK_API_KEY niet ingesteld');
    return null;
  }

  const prompt = buildTeamAvatarPrompt({
    subject: params.subject,
    gradient: params.gradient,
  });

  try {
    const task = await createMysticTask({
      prompt,
      aspectRatio: 'square_1_1',
      resolution: '2k',
      model: 'fluid',
      creativeDetailing: 40,
    });
    const imageUrl = await waitForMysticTask(task.data.task_id);
    if (!imageUrl) return null;
    return await fetchAsBuffer(imageUrl);
  } catch (err) {
    console.error('Team avatar generation failed:', err);
    return null;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractKeywords(title: string, scene: string): string {
  // Keep simple: title + first 8 words of scene, strip stopwords
  const combined = `${title} ${scene}`;
  const stopwords = new Set([
    'the',
    'and',
    'of',
    'a',
    'an',
    'to',
    'in',
    'on',
    'for',
    'with',
    'that',
    'this',
    'is',
    'are',
    'or',
    'it',
  ]);
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w))
    .slice(0, 8)
    .join(' ');
}
