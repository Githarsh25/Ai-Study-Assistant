const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { question, notes } = req.body;

    if (!question || !notes) {
      return res.status(400).json({ error: 'Question and notes are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ success: true, answer });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
  }
});

module.exports = router;