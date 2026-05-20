import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_RESUME_TEXT_LENGTH = 12000;

function normalizeResumeText(text: string) {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_RESUME_TEXT_LENGTH);
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    const text = normalizeResumeText(data.text);

    if (!text) {
      return NextResponse.json(
        { error: 'No readable text found in this PDF' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      characterCount: text.length,
    });
  } catch (error) {
    console.error('Resume parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
