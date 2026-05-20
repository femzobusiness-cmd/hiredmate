import { createSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { transcript: '', error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get('audio');

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { transcript: '', error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const buffer = Buffer.from(await audio.arrayBuffer());
    const file = new File([buffer], 'audio.webm', {
      type: audio.type || 'audio/webm',
    });

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language: 'en',
    });

    return NextResponse.json({ transcript: transcription.text || '' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Voice transcribe error:', err.message);
    return NextResponse.json(
      { transcript: '', error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
