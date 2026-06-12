import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getUser } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';
import {
    isAllowedUpload,
    ALLOWED_UPLOAD_EXTENSIONS,
    MAX_PROJECTS,
    MAX_UPLOAD_BYTES,
    STORAGE_BUCKET,
    fileExtension,
} from '@/lib/studio/limits';
import { PBIX_HELP } from '@/lib/pbi-parser';

function safeFilename(filename: string): string {
    const base = filename.split(/[/\\]/).pop() ?? 'model';
    return base.replace(/[^\w.\-() ]+/g, '_').slice(0, 120);
}

// Geeft een kortlevende signed upload-URL uit zodat de browser het
// modelbestand rechtstreeks naar de private bucket stuurt (de ~4,5 MB
// body-limiet van Vercel-functions wordt zo omzeild).
export async function POST(req: Request) {
    const limit = checkRateLimit(req, 'studio-upload-url', 10, 60_000);
    if (!limit.ok) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
        );
    }

    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    const { filename, size } = await req.json().catch(() => ({}));
    if (typeof filename !== 'string' || typeof size !== 'number') {
        return NextResponse.json({ error: 'filename en size zijn verplicht.' }, { status: 400 });
    }

    if (fileExtension(filename) === '.pbix') {
        return NextResponse.json({ error: PBIX_HELP }, { status: 400 });
    }
    if (!isAllowedUpload(filename)) {
        return NextResponse.json(
            { error: `Bestandstype niet ondersteund. Toegestaan: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}` },
            { status: 400 }
        );
    }
    if (size <= 0 || size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
            { error: `Bestand te groot (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).` },
            { status: 400 }
        );
    }

    const { count, error: countError } = await supabase
        .from('studio_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
    if (countError) {
        console.error('studio upload-url: count failed', countError.message);
        return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
    }
    if ((count ?? 0) >= MAX_PROJECTS) {
        return NextResponse.json(
            { error: `Beta-limiet bereikt: maximaal ${MAX_PROJECTS} projecten. Verwijder eerst een project.` },
            { status: 403 }
        );
    }

    const projectId = randomUUID();
    const path = `${user.id}/${projectId}/${safeFilename(filename)}`;
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path);
    if (error || !data) {
        console.error('studio upload-url: sign failed', error?.message);
        return NextResponse.json({ error: 'Upload-URL aanmaken mislukte.' }, { status: 500 });
    }

    return NextResponse.json({ projectId, path: data.path, token: data.token });
}
