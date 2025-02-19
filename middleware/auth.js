const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const encryptData = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      console.log('Encryption: Invalid input type or empty string');
      return '';
    }
    
    const version = '1:'; 
    const encrypted = CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET).toString();
    return version + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

const decryptData = (ciphertext) => {
  try {
    if (!ciphertext || typeof ciphertext !== 'string') {
      console.log('Decryption: Invalid input type or empty string');
      return '';
    }

    let actualCiphertext = ciphertext;
    if (ciphertext.startsWith('1:')) {
      actualCiphertext = ciphertext.substring(2);
    }

    const bytes = CryptoJS.AES.decrypt(actualCiphertext.trim(), process.env.CRYPTO_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      console.log('Decryption produced empty string for input:', ciphertext.substring(0, 20) + '...');
      return '';
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error for input:', ciphertext.substring(0, 20) + '...', error);
    return '';
  }
};

module.exports = { verifyToken, encryptData, decryptData };