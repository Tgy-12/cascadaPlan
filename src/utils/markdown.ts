/**
 * Ultra-lightweight, safe Markdown formatter for task descriptions.
 * Handles headings, bold, italic, inline code, code blocks, checklists, links, and line breaks.
 */
export function formatMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Escape standard HTML tags for safety
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced Code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    return `<pre class="my-2 p-2.5 rounded bg-black/40 text-xs font-mono overflow-x-auto text-emerald-400 border border-white/10"><code>${code.trim()}</code></pre>`;
  });

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/30 text-xs font-mono text-pink-400 border border-white/10">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white/90 mt-2 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-white mt-3 mb-1.5">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-white mt-3 mb-2">$1</h1>');

  // Checklists: - [ ] or - [x]
  html = html.replace(/^-\s*\[x\]\s*(.*$)/gim, '<div class="flex items-center gap-2 text-xs text-white/60 line-through my-0.5"><span class="w-3.5 h-3.5 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 text-[10px]">✓</span> $1</div>');
  html = html.replace(/^-\s*\[ \]\s*(.*$)/gim, '<div class="flex items-center gap-2 text-xs text-white/80 my-0.5"><span class="w-3.5 h-3.5 rounded border border-white/30 inline-block"></span> $1</div>');

  // Bullet points
  html = html.replace(/^-\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-white/80 my-0.5">$1</li>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-white/90">$1</em>');

  // Markdown links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline inline-flex items-center gap-0.5">$1 ↗</a>'
  );

  // Line breaks to <br/> (unless already inside tags)
  html = html.replace(/\n/g, '<br/>');

  return html;
}
