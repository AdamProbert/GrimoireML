import { NextRequest, NextResponse } from 'next/server';
import { fetchPageByUrl, searchCardsRaw } from '../../../../lib/scryfall';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const next = (searchParams.get('next') || '').trim();

  try {
    if (next) {
      // next is expected to be a full Scryfall next_page URL
      const raw = await fetchPageByUrl(next);
      const data = (raw?.data || []).slice(0, 60).map((c: any) => ({
        id: c.id,
        name: c.name,
        image: `/api/card-image/${c.id}`,
        mana_cost: c.mana_cost,
        type_line: c.type_line,
      }));
      return NextResponse.json({ data, query: q || null, count: data.length, has_more: !!raw?.has_more, next_page: raw?.next_page || null });
    }

    if (!q) {
      return NextResponse.json({ error: 'Missing q' }, { status: 400 });
    }

    // Use the raw page so we can return pagination metadata (has_more, next_page)
    const raw = await searchCardsRaw(q);
    const data = (raw?.data || []).slice(0, 60).map((c: any) => ({
      id: c.id,
      name: c.name,
      image: `/api/card-image/${c.id}`,
      mana_cost: c.mana_cost,
      type_line: c.type_line,
    }));
    return NextResponse.json({ data, query: q, count: data.length, has_more: !!raw?.has_more, next_page: raw?.next_page || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}
