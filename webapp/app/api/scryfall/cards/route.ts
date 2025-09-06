import { NextRequest, NextResponse } from 'next/server';
import { searchCardsLite } from '../../../../lib/scryfall';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }
  try {
    const data = await searchCardsLite(q);
    return NextResponse.json({ data, query: q, count: data.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}
