const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'quiz route working' });
});

module.exports = router;