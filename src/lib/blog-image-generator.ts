/**
 * Legacy entry-point voor blog image generation.
 *
 * Deze file bestond eerder als DALL-E 3 pipeline. De implementatie is
 * verhuisd naar ./image-generator.ts (Freepik Mystic + stock-search fallback).
 * Deze file re-exporteert de nieuwe functie zodat bestaande call-sites
 * (api/admin/blog/route.ts, api/admin/blog/generate/route.ts) ongewijzigd
 * blijven werken.
 */

export { generateBlogImage } from './image-generator';
