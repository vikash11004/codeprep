import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const problemsPath = path.join(__dirname, 'data', 'problems.json');

async function main() {
  console.log('Loading existing problems...');
  let problems = [];
  try {
    problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
  } catch (e) {
    console.error('Error reading problems.json:', e.message);
    process.exit(1);
  }

  // Find unique categories and their current counts
  const categoryCounts = {};
  const existingIds = new Set();
  problems.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    existingIds.add(p.id);
  });

  const targetPerCategory = 25;
  const allCategories = Object.keys(categoryCounts);

  console.log(`Found ${allCategories.length} categories. Target: ${targetPerCategory} per category.`);

  for (const category of allCategories) {
    let currentCount = categoryCounts[category];
    if (currentCount >= targetPerCategory) {
      console.log(`Category '${category}' already has ${currentCount} problems. Skipping.`);
      continue;
    }

    const needed = targetPerCategory - currentCount;
    console.log(`\nCategory '${category}' needs ${needed} more problems. Generating...`);

    const prompt = `
      You are a LeetCode problem dataset generator. 
      I need exactly ${needed} unique coding problems for the category: "${category}".
      Do not repeat the following problem IDs: ${Array.from(existingIds).join(', ')}.

      You must return ONLY a JSON object with a single key "problems" containing an array of ${needed} problem objects.
      The schema for each problem MUST perfectly match this:
      {
        "id": "kebab-case-problem-name",
        "title": "Title Case Problem Name",
        "difficulty": "Easy" | "Medium" | "Hard",
        "category": "${category}",
        "tags": ["array", "etc"],
        "sourceUrl": "https://leetcode.com/problems/kebab-case-problem-name/",
        "description": "Full problem description. Use markdown backticks for variables.",
        "constraints": ["Constraint 1", "Constraint 2"],
        "examples": [
          { "input": "...", "output": "...", "explanation": "..." }
        ]
      }
      
      Generate exactly ${needed} problems.
    `;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        console.error(`Received empty response for ${category}`);
        continue;
      }

      const parsed = JSON.parse(rawContent);
      if (parsed.problems && Array.isArray(parsed.problems)) {
        let addedCount = 0;
        parsed.problems.forEach(p => {
          if (!existingIds.has(p.id)) {
            p.category = category; // Ensure category is correct
            problems.push(p);
            existingIds.add(p.id);
            addedCount++;
            categoryCounts[category]++;
          }
        });
        console.log(`Successfully added ${addedCount} problems to '${category}'.`);
        
        // Save incrementally
        fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
      } else {
        console.error(`Invalid JSON structure returned for ${category}.`);
      }
    } catch (err) {
      console.error(`Error generating problems for ${category}:`, err.message);
    }
  }

  console.log('\nFinished generating problems. Total problems now:', problems.length);
}

main().catch(console.error);
