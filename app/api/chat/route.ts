import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Groq API Key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    let { messages, model = 'llama-3.3-70b-versatile', systemPrompt } = body;

    if (model === 'mixtral-8x7b-32768') {
      model = 'llama-3.3-70b-versatile';
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const payload: any = {
      model,
      messages: [],
    };

    if (systemPrompt) {
      payload.messages.push({ role: 'system', content: systemPrompt });
    }

    // Map messages array to standard openai format: { role: 'user' | 'assistant', content: string }
    payload.messages.push(
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text || m.content || '',
      }))
    );

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, error: `Groq error: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ success: true, text: assistantMessage });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error calling Groq API' },
      { status: 500 }
    );
  }
}
