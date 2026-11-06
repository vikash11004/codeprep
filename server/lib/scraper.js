import { validateUrl } from './public-url.js';
import { scraplingFetch } from './scrapling.js';
export { publicAddress, validateUrl } from './public-url.js';
import { Agent, fetch as request } from 'undici';
import { load } from 'cheerio';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

export async function safeFetch(value, options = {}, hops = 0) {
  if (hops > 4) throw new Error('The page redirected too many times.');
  const { url, addresses } = await validateUrl(value);
  // Pin DNS to the checked address; redirects are validated again.
  const dispatcher = new Agent({ connect: { lookup: (_host, opts, callback) => opts.all ? callback(null, addresses) : callback(null, addresses[0].address, addresses[0].family) } });
  try {
    const response = await request(url, { ...options, dispatcher, redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 CodePrep/3.0', Accept: 'text/html,application/json,text/plain', ...options.headers } });
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      await response.body?.cancel();
      return safeFetch(new URL(response.headers.get('location'), url).href, {}, hops + 1);
    }
    if (Number(response.headers.get('content-length')) > 3_000_000) throw new Error('Page exceeds the 3 MB import limit.');
    let length = 0; const chunks = [];
    for await (const chunk of response.body) { length += chunk.length; if (length > 3_000_000) throw new Error('Page exceeds the 3 MB import limit.'); chunks.push(chunk); }
    return { ok: response.ok, status: response.status, text: Buffer.concat(chunks).toString('utf8'), contentType: response.headers.get('content-type') || 'text/plain', url: url.href };
  } finally { await dispatcher.close(); }
}

export function htmlText(html) {
  const $ = load(html);
  $('script, style, nav, footer, header, svg, button, form, aside, .sidebar, [role="navigation"]').remove();
  $('sup').each((_, el) => $(el).replaceWith(`^${$(el).text()}`));
  $('br').replaceWith('\n');
  $('p, div, section, article, h1, h2, h3, li, pre, tr').each((_, el) => { $(el).prepend('\n'); $(el).append('\n'); });
  return $.text().replace(/\r/g, '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
export function parseStatement(raw, titleHint = '') {
  const text = raw.replace(/\r/g, '').replace(/\u00a0/g, ' ').trim();
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
  const title = titleHint || lines[0]?.replace(/^(?:title\s*:\s*|\d+\.\s*)/i, '').slice(0, 150) || 'Imported problem';
  const constraints = text.match(/(?:^|\n)Constraints?\s*:?\s*\n?([\s\S]*?)(?=\n(?:Follow.up|Expected|Related|Topics|Company|Examples?|Input|Output|Explanation)\b|$)/i)?.[1]?.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 25) || [];
  const examples = [];
  // Input/Output specifications are prose, not runnable samples. When an
  // explicit examples section exists, only parse pairs inside that section.
  const exampleStart = text.search(/(?:^|\n)(?:Examples?\s*\d*\s*:?[ \t]*(?:\n|$)|Sample\s+Input)/i);
  const exampleText = exampleStart >= 0 ? text.slice(exampleStart) : text;
  const normalized = exampleText.replace(/^(Input|Output|Explanation)\s*$/gmi, '$1:').replace(/\b(Output|Explanation)\s*:/gi, '\n$1:').replace(/\bInput\s*:/gi, '\nInput:');
  const pattern = /(?:^|\n)Input\s*:\s*([\s\S]*?)\nOutput\s*:\s*([\s\S]*?)(?=\n(?:Input\s*:|Examples?\s*\d*\s*:?|Constraints?\s*:?|Follow.up|Expected|Your Task|Note\s*:|Topics\s*:)|$)/gi;
  for (const m of normalized.matchAll(pattern)) {
    const [output, ...explanation] = m[2].split(/\nExplanation\s*:\s*/i);
    examples.push({ input: m[1].trim(), output: output.trim(), explanation: explanation.join('\n').trim() });
    if (examples.length >= 30) break;
  }
  // Competitive programming statements often have paired Sample Input / Output sections.
  if (!examples.length) {
    const sample = /(?:Sample\s+Input(?:\s*\d+)?|Input\s+Example)\s*:?\s*\n([\s\S]*?)\n(?:Sample\s+Output(?:\s*\d+)?|Output\s+Example)\s*:?\s*\n([\s\S]*?)(?=\n(?:Sample|Explanation|Note|Constraints)\b|$)/gi;
    for (const m of text.matchAll(sample)) examples.push({ input: m[1].trim(), output: m[2].trim(), explanation: '' });
  }
  let description = text.split(/\n\s*(?:Examples?\s*\d*\s*(?::|\n)|Input\s*:|Constraints?\s*:|Sample\s+Input)/i)[0].trim();
  if (description.startsWith(lines[0]) && lines[0]?.includes(title)) description = description.slice(lines[0].length).trim();
  const isValidProblem = description.length > 35 && (examples.length > 0 || /\b(given|return|find|calculate|compute|write|determine|implement|array|integer|string|input|output)\b/i.test(description)) && !/just a moment|verify you are human|access denied|captcha/i.test(title);
  return { title, description, constraints, examples, isValidProblem, difficulty: text.match(/\b(Easy|Medium|Hard)\b/)?.[1] || 'Imported', category: 'Imported', tags: [] };
}
export function extractPage(html) {
  const $ = load(html);
  const title = ($('h1').first().text() || $('meta[property="og:title"]').attr('content') || $('title').text()).split(/\s*[|–]\s*/)[0].replace(/ - (?:LeetCode|GeeksforGeeks).*$/i, '').trim();
  const candidates = [];
  $('[data-track-load="description_content"], .problem-statement, .lang-en, .content > .md, .problems_problem_content__Xm_eO, [class*="problem_content"], [class*="problem-statement"], [class*="problemStatement"], article, main, [role="main"]').each((_, el) => candidates.push($(el).html()));
  // Hydrated GFG/Next.js pages can contain the statement before it is rendered.
  function walk(value, depth = 0) {
    if (depth > 15 || !value) return;
    if (typeof value === 'string' && value.length > 40 && /input/i.test(value) && /output/i.test(value) && /<[^>]+>/.test(value)) candidates.push(value);
    else if (Array.isArray(value)) value.slice(0, 100).forEach(v => walk(v, depth + 1));
    else if (typeof value === 'object') {
      if (typeof value.problem_question === 'string') candidates.push(value.problem_question + (typeof value.constraints_display === 'string' ? `<h3>Constraints:</h3><pre>${value.constraints_display.replaceAll('<', '&lt;')}</pre>` : ''));
      Object.values(value).slice(0, 100).forEach(v => walk(v, depth + 1));
    }
  }
  for (const el of $('script[type="application/json"], script[type="application/ld+json"]').toArray()) { try { walk(JSON.parse($(el).text())); } catch { /* Not structured problem data. */ } }
  candidates.push($('body').html());
  const parsed = candidates.filter(Boolean).map(html => parseStatement(htmlText(html), title));
  const problem = parsed.filter(p => p.isValidProblem).sort((a, b) => (b.examples.length * 100 + b.constraints.length) - (a.examples.length * 100 + a.constraints.length))[0] || null;
  if (problem && !problem.examples.length) {
    const inputs = $('.sample-test .input pre').toArray(); const outputs = $('.sample-test .output pre').toArray();
    if (inputs.length === outputs.length) problem.examples = inputs.map((el, i) => ({ input: htmlText($(el).html()), output: htmlText($(outputs[i]).html()), explanation: '' }));
  }
  return problem;
}

let browserPromise;
async function browser() {
  if (!browserPromise) browserPromise = (async () => {
    const browserDir = fileURLToPath(new URL('../.tools/browsers/', import.meta.url));
    if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(browserDir)) process.env.PLAYWRIGHT_BROWSERS_PATH = browserDir;
    const { chromium } = await import('playwright');
    return chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  })().catch(error => { browserPromise = null; throw error; });
  return browserPromise;
}
export async function closeBrowser() { if (browserPromise) { const b = await browserPromise; browserPromise = null; await b.close(); } }
export async function renderPage(url, fetchPage = safeFetch) {
  await validateUrl(url);
  const context = await (await browser()).newContext({ serviceWorkers: 'block', acceptDownloads: false });
  let requests = 0;
  try {
    await context.routeWebSocket('**/*', socket => socket.close());
    await context.route('**/*', async route => {
      const req = route.request();
      if (++requests > 80 || !['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(req.resourceType()) || !['GET', 'POST'].includes(req.method())) return route.abort();
      try {
        const response = await fetchPage(req.url(), { method: req.method(), ...(req.postData() ? { body: req.postData() } : {}), headers: req.headers()['content-type'] ? { 'Content-Type': req.headers()['content-type'] } : {} });
        await route.fulfill({ status: response.status, contentType: response.contentType, body: response.text });
      } catch { await route.abort().catch(() => {}); }
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForFunction(() => /\bInput\s*:/.test(document.body.innerText) && /\bOutput\s*:/.test(document.body.innerText), null, { timeout: 6000 }).catch(() => {});
    return extractPage(await page.content());
  } finally { await context.close(); }
}
export async function importUrl(value, { fetchPage = safeFetch, fetchProfile = scraplingFetch, render = renderPage } = {}) {
  const { url } = await validateUrl(value);
  const attempts = [];
  const slug = /(^|\.)leetcode\.com$/.test(url.hostname) && url.pathname.match(/\/problems\/([^/]+)/)?.[1];
  const gfgSlug = /(^|\.)geeksforgeeks\.org$/.test(url.hostname) && url.pathname.match(/\/problems\/([^/]+)/)?.[1];
  const judgeId = slug || ({ 'kadanes-algorithm-1587115620': 'maximum-subarray' })[gfgSlug];
  if (slug) {
    try {
      const response = await fetchPage('https://leetcode.com/graphql/', { method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' }, body: JSON.stringify({ query: 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty } }', variables: { titleSlug: slug } }) });
      const q = JSON.parse(response.text)?.data?.question;
      if (q?.content) { const p = parseStatement(htmlText(q.content), q.title); if (p.isValidProblem) return { ...p, difficulty: q.difficulty, source: 'LeetCode structured data', sourceUrl: url.href, judgeId: slug }; }
    } catch { attempts.push('Structured data unavailable'); }
  }
  try {
    const response = await fetchPage(url.href);
    if (response.ok) { const p = extractPage(response.text); if (p?.examples.length) return { ...p, source: 'Public page', sourceUrl: url.href, ...(judgeId ? { judgeId } : {}) }; }
    attempts.push('Static page did not contain a complete statement');
  } catch (error) { attempts.push(error.message); }
  try {
    const response = await fetchProfile(url.href);
    if (response.ok) { const p = extractPage(response.text); if (p?.examples.length) return { ...p, source: 'Scrapling browser-profile request', sourceUrl: url.href, ...(judgeId ? { judgeId } : {}) }; }
    attempts.push('Scrapling did not find a complete public statement');
  } catch { attempts.push('Scrapling fallback unavailable'); }
  try {
    const p = await render(url.href);
    if (p?.isValidProblem) return { ...p, source: 'Browser-rendered page', sourceUrl: url.href, ...(judgeId ? { judgeId } : {}) };
  } catch (error) { attempts.push(error.message.includes('Executable') ? 'Browser is not installed; run npm run setup' : 'Browser rendering unavailable'); }
  throw new Error(`Could not read a public problem statement. The page may require sign-in, block automation, or use an unsupported format. Paste the statement to continue. ${attempts.join('. ')}`);
}
