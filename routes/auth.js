const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const VALID_CREDENTIALS = {
  username: "naval.ravikant",
  password: "05111974"
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === VALID_CREDENTIALS.username && 
      password === VALID_CREDENTIALS.password) {
    
    const token = jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ JWT: token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;