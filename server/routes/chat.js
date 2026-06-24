const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to try in order — if one is overloaded, try the next
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
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
      // For any other error, throw immediately
      throw error;
    }
  }
  throw new Error('All models are currently unavailable. Please try again in a few minutes.');
}

router.post('/', async (req, res) => {
  try {
    const { question, notes } = req.body;

    if (!question || !notes) {
      return res.status(400).json({ error: 'Question and notes are required' });
    }

    const prompt = `You are a helpful study assistant. A student has uploaded their study notes and is asking you a question about them.

STUDY NOTES:
${notes}

STUDENT'S QUESTION:
${question}

Instructions:
- Answer ONLY based on the study notes provided above
- If the answer is not in the notes, say "I couldn't find information about that in your notes."
- Keep your answer clear and student-friendly
- Use bullet points or numbered lists where it helps clarity`;

    const answer = await generateWithFallback(prompt);
    res.json({ success: true, answer });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(503).json({
      error: error.message.includes('All models')
        ? error.message
        : 'Failed to get AI response. Please try again.'
    });
  }
});

module.exports = router;