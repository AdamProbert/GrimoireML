import json, re, requests
from bs4 import BeautifulSoup

URL = "https://scryfall.com/docs/tagger-tags"
html = requests.get(URL, timeout=30).text
soup = BeautifulSoup(html, "html.parser")

data = []
# The page uses headings for groups and lists/links for tags.
# This logic walks h2/h3 sections then gathers following <ul>/<ol> items until the next heading.
headings = soup.select("h2, h3")


def clean_tag(text):
    t = re.sub(r"\s+", " ", text.strip())
    # slugs are typically shown like otag:ramp or art:dragon; normalize both the slug and label
    return t


for i, h in enumerate(headings):
    section = {"category": h.get_text(strip=True), "tags": []}
    cur = h
    # collect siblings until next heading
    sib = cur.find_next_sibling()
    while sib and sib.name not in ["h2", "h3"]:
        for a in sib.select("a[href]"):
            label = clean_tag(a.get_text())
            href = a["href"]
            # try to extract the raw tag key from the label (e.g., otag:ramp, art:dragon)
            # fall back to label text if not in that format
            m = re.search(r"\b([ao]tag|arttag|tag):[A-Za-z0-9._-]+", label)
            key = m.group(0) if m else label
            section["tags"].append(
                {
                    "key": key,
                    "label": label,
                    "url": (
                        f"https://scryfall.com{href}" if href.startswith("/") else href
                    ),
                }
            )
        sib = sib.find_next_sibling()
    # de-dup while preserving order
    seen = set()
    uniq = []
    for t in section["tags"]:
        k = (t["key"], t["url"])
        if k not in seen:
            seen.add(k)
            uniq.append(t)
    section["tags"] = uniq
    if section["tags"]:
        data.append(section)

with open("scryfall_tagger_tags.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(
    f"Wrote {sum(len(s['tags']) for s in data)} tags across {len(data)} categories to scryfall_tagger_tags.json"
)
