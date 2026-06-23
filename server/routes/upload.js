const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PdfReader } = require('pdfreader');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper function — wraps pdfreader's callback style into a Promise
function extractTextFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new PdfReader();
    let text = '';

    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // null item means end of file
        resolve(text);
      } else if (item.text) {
        text += item.text + ' ';
      }
    });
  });
}

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const extractedText = await extractTextFromBuffer(req.file.buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from this PDF. It may be a scanned image.' });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      characterCount: extractedText.length,
      text: extractedText
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF: ' + error.message });
  }
});

module.exports = router;