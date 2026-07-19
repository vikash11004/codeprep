import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are an expert test case generator for coding interview problems. Given a structured problem description, generate 4 to 6 comprehensive test cases that cover:
1. Basic/happy path cases
2. Edge cases (empty inputs, single elements, minimum values)
3. Boundary cases (maximum constraints)
4. Tricky cases that commonly trip up candidates

You must respond in JSON format:
{
  "testCases": [
    {
      "input": "The exact input as a string that can be parsed",
      "expectedOutput": "The exact expected output as a string",
      "description": "Brief description of what this test case covers",
      "isEdgeCase": boolean
    }
  ]
}

IMPORTANT: 
- Input and expectedOutput must be valid JavaScript-parseable strings.
- For arrays, use JSON array notation: "[1,2,3]"
- For strings, include the string value directly: "hello"
- For numbers, use the number directly: "42"
- For booleans, use: "true" or "false"
- Make sure the expectedOutput is the CORRECT answer for the given input.`;

router.post('/generate-tests', async (req, res) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem data is required' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const problemDescription = `
Title: ${problem.title}
Description: ${problem.description}
Constraints: ${(problem.constraints || []).join(', ')}
Examples: ${JSON.stringify(problem.examples || [])}
    `.trim();

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: problemDescription },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Flag all test cases as AI-generated
    const testCases = (parsed.testCases || []).map(tc => ({
      ...tc,
      aiGenerated: true,
    }));

    return res.json({ testCases });
  } catch (err) {
    console.error('[/api/generate-tests] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate test cases', message: err.message });
  }
});

export default router;
