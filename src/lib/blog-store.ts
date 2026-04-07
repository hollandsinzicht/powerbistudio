import { supabase } from './supabase'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  published_at: string | null
  scheduled_for: string | null
  seo_title: string | null
  seo_description: string | null
  target_keywords: string[]
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface BlogIdea {
  id: string
  title: string
  keywords: string[]
  rationale: string | null
  target_audience: string | null
  status: 'suggested' | 'approved' | 'rejected' | 'written'
  blog_post_id: string | null
  created_at: string
}

// ===== POSTS =====

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw new Error(`Failed to get posts: ${error.message}`)
  return data || []
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to get all posts: ${error.message}`)
  return data || []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(`Failed to get post: ${error.message}`)
  return data
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Failed to get post: ${error.message}`)
  return data
}

export async function createPost(post: {
  slug: string
  title: string
  excerpt: string
  content: string
  image?: string
  status?: 'draft' | 'published'
  published_at?: string
  seo_title?: string
  seo_description?: string
  target_keywords?: string[]
  ai_generated?: boolean
}): Promise<string> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || null,
      status: post.status || 'draft',
      published_at: post.published_at || (post.status === 'published' ? new Date().toISOString() : null),
      seo_title: post.seo_title || null,
      seo_description: post.seo_description || null,
      target_keywords: post.target_keywords || [],
      ai_generated: post.ai_generated || false,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create post: ${error.message}`)
  return data.id
}

export async function updatePost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'created_at'>>) {
  const { error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`Failed to update post: ${error.message}`)
}

export async function publishPost(id: string) {
  await updatePost(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  })
}

export async function archivePost(id: string) {
  await updatePost(id, { status: 'archived' })
}

export async function schedulePost(id: string, scheduledFor: string) {
  await updatePost(id, {
    status: 'scheduled',
    scheduled_for: scheduledFor,
  })
}

/**
 * Bepaal de volgende vrije publicatiedatum.
 * = dag na de laatst geplande post + 07:00 UTC
 * Als er geen geplande posts zijn → morgen 07:00 UTC
 */
export async function getNextAvailableScheduleDate(): Promise<string> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('scheduled_for')
    .eq('status', 'scheduled')
    .order('scheduled_for', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to get next schedule date: ${error.message}`)

  let baseDate: Date
  if (data?.scheduled_for) {
    baseDate = new Date(data.scheduled_for)
  } else {
    baseDate = new Date()
  }

  // Volgende dag, 07:00 UTC
  const nextDate = new Date(baseDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  nextDate.setUTCHours(7, 0, 0, 0)

  return nextDate.toISOString()
}

/**
 * Wissel de scheduled_for datums van twee posts om.
 * Gebruikt voor reorder via pijl-knoppen.
 */
export async function swapScheduleDates(idA: string, idB: string): Promise<void> {
  const [{ data: postA, error: errA }, { data: postB, error: errB }] = await Promise.all([
    supabase.from('blog_posts').select('scheduled_for').eq('id', idA).maybeSingle(),
    supabase.from('blog_posts').select('scheduled_for').eq('id', idB).maybeSingle(),
  ])

  if (errA || errB) throw new Error(`Failed to fetch posts for swap: ${errA?.message || errB?.message}`)
  if (!postA?.scheduled_for || !postB?.scheduled_for) {
    throw new Error('Beide posts moeten een scheduled_for datum hebben')
  }

  await Promise.all([
    updatePost(idA, { scheduled_for: postB.scheduled_for }),
    updatePost(idB, { scheduled_for: postA.scheduled_for }),
  ])
}

export async function getScheduledPostsDue(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', new Date().toISOString())

  if (error) throw new Error(`Failed to get scheduled posts: ${error.message}`)
  return data || []
}

// ===== IDEAS =====

export async function getIdeas(): Promise<BlogIdea[]> {
  const { data, error } = await supabase
    .from('blog_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to get ideas: ${error.message}`)
  return data || []
}

export async function createIdea(idea: {
  title: string
  keywords: string[]
  rationale?: string
  target_audience?: string
}): Promise<string> {
  const { data, error } = await supabase
    .from('blog_ideas')
    .insert({
      title: idea.title,
      keywords: idea.keywords,
      rationale: idea.rationale || null,
      target_audience: idea.target_audience || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create idea: ${error.message}`)
  return data.id
}

export async function updateIdeaStatus(id: string, status: BlogIdea['status'], blogPostId?: string) {
  const updates: Record<string, unknown> = { status }
  if (blogPostId) updates.blog_post_id = blogPostId

  const { error } = await supabase
    .from('blog_ideas')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(`Failed to update idea: ${error.message}`)
}

export async function getIdeaById(id: string): Promise<BlogIdea | null> {
  const { data, error } = await supabase
    .from('blog_ideas')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Failed to get idea: ${error.message}`)
  return data
}

export async function deleteIdea(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_ideas')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete idea: ${error.message}`)
}

/**
 * Verwijder alle ideeën uit de database. Gebruikt voor de "clean slate" knop
 * zodat de gebruiker met nieuwe keywords kan starten.
 */
export async function deleteAllIdeas(): Promise<number> {
  // Haal eerst count op voor feedback
  const { count } = await supabase
    .from('blog_ideas')
    .select('*', { count: 'exact', head: true })

  const { error } = await supabase
    .from('blog_ideas')
    .delete()
    .not('id', 'is', null) // delete all rows (Supabase vereist een filter)

  if (error) throw new Error(`Failed to delete all ideas: ${error.message}`)
  return count || 0
}
