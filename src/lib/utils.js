// Shared helpers used across pages.

// Fisher–Yates shuffle. Returns a new array; does not mutate the input.
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Stable identity for a flashcard, independent of front/back orientation.
export function cardKey(front, back) {
  return front + "|" + back;
}

// Parse pasted text into [{ front, back }] pairs.
// Each line is split on the first " - " or ":" separator.
export function parseWords(text) {
  const result = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const sep = t.includes(" - ") ? " - " : t.includes(":") ? ":" : null;
    if (!sep) continue;
    const idx = t.indexOf(sep);
    const front = t.slice(0, idx).trim();
    const back = t.slice(idx + sep.length).trim();
    if (front && back) result.push({ front, back });
  }
  return result;
}
