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
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const trimmedNotes = notes.length > 3000 ? notes.substring(0, 3000) + '...' : notes;

    const prompt = `You are a flashcard generator for students. Based on the study notes below, generate 10 flashcards covering the most important concepts, terms, and facts.

STUDY NOTES:
${trimmedNotes}

STRICT RULES:
- Return ONLY a valid JSON array, no markdown, no backticks, no explanation
- Each flashcard has a "term" (front) and "definition" (back)
- Keep terms concise (1-5 words)
- Keep definitions clear and student-friendly (1-3 sentences max)

Required JSON format:
[
  {
    "term": "Key term or concept",
    "definition": "Clear explanation of the term based on the notes"
  }
]`;

    let responseText = await generateWithFallback(prompt);
    responseText = responseText.replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(responseText);

    res.json({ success: true, flashcards });

  } catch (error) {
    console.error('Flashcards error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards: ' + error.message });
  }
});

module.exports = router;