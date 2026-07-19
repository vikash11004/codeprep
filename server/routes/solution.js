import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const getSystemPrompt = (language) => `You are an expert coding interview coach. Provide a clean, well-explained reference solution for the given coding problem in the specified target language.
If the user provided their code, analyze where they went wrong, extract the exact snippet containing the mistake, explain why it's flawed, and then provide your corrected solution.

Respond ONLY in JSON format:
{
  "mistakeCode": "The snippet of the user's code containing the primary mistake (leave empty if the user's code was blank or correct)",
  "mistakeExplanation": "Explanation of what is wrong in the user's snippet",
  "solutionCode": "The complete correct solution code in ${language}",
  "solutionExplanation": "Step-by-step explanation of the approach and how it improves the code",
  "timeComplexity": "Big-O time complexity with brief justification",
  "spaceComplexity": "Big-O space complexity with brief justification",
  "keyInsight": "The critical insight or trick needed to solve this problem"
}`;

router.post('/solution', async (req, res) => {
  try {
    const { problem, sessionId, language, code } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem data is required' });
    }

    // Check session state — solution is LOCKED until hintShown is true
    const session = req.session;
    if (!session.hintShown) {
      return res.status(403).json({
        error: 'Solution is locked',
        message: 'You must attempt the problem and receive at least one hint before viewing the reference solution.',
        locked: true,
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const userMessage = `
Title: ${problem.title}
Description: ${problem.description}
Constraints: ${(problem.constraints || []).join('; ')}
Examples: ${JSON.stringify(problem.examples || [])}
Target Language: ${language || 'JavaScript'}
User's Code:
${code || '(No code provided)'}
    `.trim();

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: getSystemPrompt(language || 'JavaScript') },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const solution = JSON.parse(completion.choices[0].message.content);

    return res.json(solution);
  } catch (err) {
    console.error('[/api/solution] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate solution', message: err.message });
  }
});

export default router;
