import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are an expert coding coach and debugger. A student is working on a coding interview problem and their solution has failed some test cases.

Analyze their code against the problem description and test results. Classify the bug into EXACTLY ONE of these categories:
- "misread_problem": The student misunderstood what the problem is asking (wrong interpretation of input/output format, missed constraints, etc.)
- "wrong_approach": The algorithm/approach is fundamentally incorrect for this problem (wrong data structure, wrong strategy, missing key insight)
- "implementation_bug": The approach is correct but there's a coding error (off-by-one, wrong variable, incorrect loop bounds, syntax issue)

Provide a helpful hint that GUIDES the student toward the solution WITHOUT giving away the direct answer. Be Socratic — ask leading questions.

Respond in JSON format:
{
  "classification": "misread_problem" | "wrong_approach" | "implementation_bug",
  "hint": "A helpful, guiding hint (2-3 sentences)",
  "explanation": "Brief explanation of why this classification was chosen",
  "followUpQuestion": "A Socratic question to help the student think deeper"
}`;

router.post('/diagnose', async (req, res) => {
  try {
    const { problem, code, testResults, sessionId } = req.body;

    if (!problem || !code || !testResults) {
      return res.status(400).json({ error: 'problem, code, and testResults are required' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const failedTests = testResults.filter(t => !t.passed);
    
    const userMessage = `
PROBLEM:
Title: ${problem.title}
Description: ${problem.description}
Constraints: ${(problem.constraints || []).join('; ')}

STUDENT'S CODE:
\`\`\`${req.body.language || 'javascript'}
${code}
\`\`\`

FAILED TEST RESULTS:
${failedTests.map((t, i) => `Test ${i + 1}: Input: ${t.input} | Expected: ${t.expectedOutput} | Got: ${t.actualOutput} | Error: ${t.error || 'none'}`).join('\n')}
    `.trim();

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const diagnosis = JSON.parse(completion.choices[0].message.content);

    // Update session state
    const session = req.session;
    session.hintShown = true;
    session.attempts += 1;
    session.failed += 1;

    if (diagnosis.classification && session.failureCategories[diagnosis.classification] !== undefined) {
      session.failureCategories[diagnosis.classification] += 1;
    }

    // Track problem in history
    const existingEntry = session.problemHistory.find(p => p.title === problem.title);
    if (existingEntry) {
      existingEntry.attempts += 1;
      existingEntry.lastClassification = diagnosis.classification;
    } else {
      session.problemHistory.push({
        title: problem.title,
        attempts: 1,
        solved: false,
        lastClassification: diagnosis.classification,
      });
    }

    await session.save();

    return res.json({
      ...diagnosis,
      hintShown: true,
    });
  } catch (err) {
    console.error('[/api/diagnose] Error:', err.message);
    res.status(500).json({ error: 'Diagnosis failed', message: err.message });
  }
});

export default router;
