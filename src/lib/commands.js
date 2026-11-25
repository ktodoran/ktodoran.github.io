// Command palette matching. Pure functions, no DOM, so they can be unit tested.

// Scores how well `query` matches `text`. Higher is better, 0 means no match.
// Every query character must appear in order; contiguous runs and matches at
// the start of a word score more than scattered ones.
export function score(text, query) {
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase().replace(/\s+/g, '');
  if (!needle) return 1;

  let total = 0;
  let cursor = 0;
  let run = 0;

  for (const char of needle) {
    const found = haystack.indexOf(char, cursor);
    if (found === -1) return 0;

    run = found === cursor ? run + 1 : 1;
    const startsWord = found === 0 || /[\s(/-]/.test(haystack[found - 1]);
    total += 1 + run * 2 + (startsWord ? 4 : 0);
    cursor = found + 1;
  }

  // Slight preference for shorter labels when scores tie.
  return total + 1 / (haystack.length + 1);
}

// Keywords are matched as plain substrings (every word of the query must appear),
// so loose subsequence hits on a long keyword list don't flood the results.
function keywordScore(keywords, query) {
  if (!keywords) return 0;
  const haystack = keywords.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => haystack.includes(word)) ? 1 : 0;
}

export function filterCommands(commands, query) {
  if (!query.trim()) return commands;

  return commands
    .map((command) => {
      const labelRank = score(command.label, query);
      // Any label match outranks a keyword-only match.
      return { command, rank: labelRank > 0 ? labelRank + 1 : keywordScore(command.keywords, query) };
    })
    .filter((entry) => entry.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .map((entry) => entry.command);
}
