import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are an expert coding platform backend. Your task is to generate ONLY the starter code (the function stub) for a given programming problem in the specified language, exactly as LeetCode or GeeksforGeeks would provide.
Do not include any boilerplate (like #include <iostream> or class Main if it's not strictly part of the solution stub). For Java, provide a class Solution with the method.
Do not include any explanations, markdown code fences, or any other text. Output ONLY the raw code string.`;

const FALLBACK_CODE = {
  'JavaScript': `// Write your solution here\nfunction solution(input) {\n  // Your code here\n}\n`,
  'Python': `# Write your solution here\ndef solution(input):\n    # Your code here\n    pass\n`,
  'Java': `// Write your solution here\nclass Solution {\n    public void solution() {\n        // Your code here\n    }\n}\n`,
  'C++': `// Write your solution here\n#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};\n`,
  'C': `// Write your solution here\n#include <stdio.h>\n#include <stdlib.h>\n\nvoid solution() {\n    // Your code here\n}\n`
};

router.post('/starter-code', async (req, res) => {
  try {
    const { problem, language } = req.body;

    if (!problem || !language) {
      return res.status(400).json({ error: 'problem and language are required' });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your-groq-api-key-here')) {
      return res.json({ starterCode: FALLBACK_CODE[language] || FALLBACK_CODE['C++'] });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const userMessage = `
Problem Title: ${problem.title}
Problem Description: ${problem.description}
Examples: ${JSON.stringify(problem.examples || [])}
Target Language: ${language}

Generate the exact function signature / starter class for this problem in ${language}.
`.trim();

    const completion = await groq.chat.completions.create({
      model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    let code = completion.choices[0].message.content.trim();
    // In case the model still outputs markdown code blocks, strip them
    if (code.startsWith('\`\`\`')) {
      const lines = code.split('\\n');
      if (lines.length > 2) {
        code = lines.slice(1, lines.length - 1).join('\\n');
      }
    }

    return res.json({ starterCode: code });
  } catch (err) {
    console.error('[/api/starter-code] Error:', err.message);
    const fallback = FALLBACK_CODE[req.body.language] || FALLBACK_CODE['C++'];
    res.json({ starterCode: fallback });
  }
});

export default router;
