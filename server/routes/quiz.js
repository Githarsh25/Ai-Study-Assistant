const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

async function generateWithFallback(prompt) {
  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Success with model: ${modelName}`);
      return result.response.text();
    } catch (error) {
      if (error.status === 503 || error.status === 429) {
        console.log(`❌ ${modelName} unavailable (${error.status}), trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('All models are currently unavailable. Please try again later.');
}

router.post('/', async (req, res) => {
  try {
    const { notes, count } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const questionCount = count || 5;
    const trimmedNotes = notes.length > 3000 ? notes.substring(0, 3000) + '...' : notes;

    const prompt = `You are a quiz generator. Based on the study notes below, generate exactly ${questionCount} multiple choice questions.

STUDY NOTES:
${trimmedNotes}

STRICT RULES:
- Return ONLY a valid JSON array, no markdown, no backticks, no explanation
- Each question must have exactly 4 options
- correctAnswer must be the exact text of the correct option
- Keep questions clear and directly based on the notes

Required JSON format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct"
  }
]`;

    let responseText = await generateWithFallback(prompt);
    responseText = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(responseText);

    res.json({ success: true, questions });

  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz: ' + error.message });
  }
});

module.exports = router;