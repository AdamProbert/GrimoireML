export interface ParsedCardLine {
  name: string;
  count: number;
}

export interface ParsedDeckList {
  cards: ParsedCardLine[];
  total: number;
  errors: string[];
}

const lineRegex = /^(\d+)[xX]?\s+(.+?)\s*$/;

export function parseDeckList(raw: string): ParsedDeckList {
  const lines = raw.split(/\r?\n/);
  const map = new Map<string, number>();
  const errors: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const original = lines[i].trim();
    if (!original) continue;
    if (original.startsWith('#') || original.startsWith('//')) continue;
    const m = original.match(lineRegex);
    if (!m) {
      errors.push(`Line ${i + 1}: could not parse "${original}"`);
      continue;
    }
    const count = parseInt(m[1], 10);
    let name = m[2].trim();
    // Normalize multiple spaces
    name = name.replace(/\s+/g, ' ');
    // Keep double-faced names as-is (contain //) – treat entire string as card name
    map.set(name, (map.get(name) || 0) + count);
  }
  const cards = Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const total = cards.reduce((acc, c) => acc + c.count, 0);
  return { cards, total, errors };
}
