import { Router } from 'express';
import Groq from 'groq-sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();
const problems = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'problems.json'), 'utf-8'));
const SYSTEM_PROMPT = `Extract one programming problem from the supplied text. Return strict JSON only: {"title":"string","description":"string","constraints":["string"],"examples":[{"input":"string","output":"string","explanation":"string"}],"isValidProblem":boolean}. Ignore menus, ads, and page chrome.`;

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<\/?(p|div|section|article|main|h[1-6]|li|pre|br|tr|dt|dd)[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function normaliseText(text = '') {
  return text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function titleFromText(lines) {
  const labelled = lines.find(line => /^title\s*:/i.test(line));
  if (labelled) return labelled.replace(/^title\s*:/i, '').trim();
  const candidate = lines.find(line => line.length > 2 && line.length < 110 && !/^(given|you are|write |return |input|output|constraints?|examples?)/i.test(line));
  return candidate?.replace(/^\d+\.\s*/, '').trim() || 'Imported coding problem';
}

function linesAfterHeading(lines, headingPattern) {
  const index = lines.findIndex(line => headingPattern.test(line));
  if (index < 0) return [];
  const output = [];
  for (let i = index + 1; i < lines.length; i += 1) {
    if (/^(example|input|output|explanation|follow[ -]?up|note|hint)\b/i.test(lines[i])) break;
    output.push(lines[i]);
  }
  return output;
}

// This parser intentionally handles the common format used by LeetCode, HackerRank,
// GeeksForGeeks, and copied interview docs. It lets pasting work even offline.
function parseProblemLocally(rawText) {
  const text = normaliseText(rawText);
  const lines = text.split('\n').map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const title = titleFromText(lines);
  const constraints = linesAfterHeading(lines, /^constraints?\b/i).filter(line => line.length < 300).slice(0, 12);
  const examples = [];
  const examplePattern = /(?:^|\n)\s*(?:example\s*\d*\s*:?)?\s*input\s*:\s*([\s\S]*?)\n\s*output\s*:\s*([\s\S]*?)(?=\n\s*(?:example\s*\d*\s*:?)?\s*input\s*:|\n\s*example\s*\d*\s*:|$)/gi;
  for (const match of text.matchAll(examplePattern)) {
    const [input, outputBlock] = [match[1].trim(), match[2].trim()];
    const explanationMatch = outputBlock.match(/^([\s\S]*?)(?:\n\s*explanation\s*:\s*([\s\S]*))$/i);
    examples.push({ input, output: (explanationMatch?.[1] || outputBlock).trim(), explanation: explanationMatch?.[2]?.trim() || '' });
  }
  const description = lines.filter(line => {
    const lower = line.toLowerCase();
    return line !== title && !/^title\s*:/i.test(line) && !/^(constraints?|examples?\s*\d*)\s*:?[\s]*$/i.test(line) && !/^(input|output|explanation)\s*:/i.test(lower) && !constraints.includes(line);
  }).slice(0, 30).join('\n').trim();
  const looksLikeProblem = /(given|return|write|implement|array|string|integer|algorithm|function|input|output|constraint)/i.test(text) && (description.length > 25 || examples.length > 0);
  return { title, description: description || text.slice(0, 3000), constraints, examples, isValidProblem: looksLikeProblem };
}

function isPublicUrl(parsed) {
  const host = parsed.hostname.toLowerCase();
  return !['localhost', '0.0.0.0', '::1'].includes(host) && !/^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

async function fetchLeetCodeProblem(parsed) {
  if (!/(^|\.)leetcode\.com$/i.test(parsed.hostname)) return null;
  const slug = parsed.pathname.match(/\/problems\/([^/?#]+)/i)?.[1];
  if (!slug) return null;
  const query = 'query questionTitle($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty exampleTestcases } }';
  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com/' },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }), signal: AbortSignal.timeout(10000),
    });
    const question = (await response.json())?.data?.question;
    if (!question?.content) return null;
    return { text: `${question.title}\n\n${htmlToText(question.content)}\n\nExamples\n${question.exampleTestcases || ''}`, method: 'leetcode-api' };
  } catch { return null; }
}

async function fetchProblemPage(url) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol) || !isPublicUrl(parsed)) throw new Error('Enter a public http(s) URL.');
  const leetCode = await fetchLeetCodeProblem(parsed);
  if (leetCode) return leetCode;
  const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; CodePrep/2.1)', Accept: 'text/html,application/xhtml+xml' };
  try {
    const response = await fetch(parsed, { headers, signal: AbortSignal.timeout(12000), redirect: 'follow' });
    if (response.ok) {
      const text = htmlToText(await response.text());
      if (text.length > 300) return { text, method: 'direct' };
    }
  } catch { /* Continue to the public reader fallback. */ }
  try {
    const readerUrl = `https://r.jina.ai/http://${parsed.host}${parsed.pathname}${parsed.search}`;
    const response = await fetch(readerUrl, { headers: { Accept: 'text/plain' }, signal: AbortSignal.timeout(15000) });
    const text = response.ok ? normaliseText(await response.text()) : '';
    if (text.length > 300) return { text, method: 'reader-fallback' };
  } catch { /* Handled by the useful error below. */ }
  throw new Error('We could not read a public problem statement from that URL.');
}

async function enrichWithAi(localProblem, text) {
  if (!process.env.GROQ_API_KEY) return localProblem;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({ model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: text.slice(0, 18000) }], temperature: 0.1, max_tokens: 2200 });
    const ai = JSON.parse(completion.choices[0].message.content);
    return { ...localProblem, ...ai, title: ai.title || localProblem.title, description: ai.description || localProblem.description, constraints: ai.constraints?.length ? ai.constraints : localProblem.constraints, examples: ai.examples?.length ? ai.examples : localProblem.examples, isValidProblem: ai.isValidProblem !== false };
  } catch (error) {
    console.warn('Problem import AI enrichment unavailable; using local parser:', error.message);
    return localProblem;
  }
}

router.post('/interpret', async (req, res) => {
  try {
    const { rawText, url, catalogId } = req.body;
    if (catalogId) {
      const problem = problems.find(problem => problem.id === catalogId);
      return problem ? res.json({ ...problem, isValidProblem: true, source: 'catalog' }) : res.status(404).json({ error: 'Problem not found', isValidProblem: false });
    }
    const imported = url ? await fetchProblemPage(url) : { text: rawText, method: 'paste' };
    if (!imported.text?.trim()) return res.status(400).json({ error: 'Paste a problem statement or provide a public URL.', isValidProblem: false });
    const localProblem = parseProblemLocally(imported.text);
    if (!localProblem.isValidProblem) return res.status(422).json({ error: 'That content does not look like a complete coding problem yet.', suggestion: 'Include the problem statement and at least one Input / Output example.', isValidProblem: false });
    const problem = await enrichWithAi(localProblem, imported.text);
    return res.json({ ...problem, source: url ? imported.method : 'paste', parser: problem === localProblem ? 'local' : 'ai-assisted' });
  } catch (error) {
    return res.status(400).json({ error: error.message, suggestion: 'Try pasting the statement, constraints, and one Input / Output example directly.', isValidProblem: false });
  }
});

router.get('/problems', (req, res) => res.json(problems.map(({ id, title, difficulty, category, tags, sourceUrl, solved, attempts }) => ({ id, title, difficulty, category, tags, sourceUrl, solved, attempts }))));
router.get('/problems/:id', (req, res) => { const problem = problems.find(item => item.id === req.params.id); return problem ? res.json({ ...problem, isValidProblem: true, source: 'catalog' }) : res.status(404).json({ error: 'Problem not found' }); });
export default router;
