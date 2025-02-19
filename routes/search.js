const express = require('express');
const router = express.Router();
const { verifyToken, decryptData } = require('../middleware/auth');
const Applicant = require('../models/applicant');

router.post('/name', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const applicants = await Applicant.find({});
    console.log(`Searching for name: ${name}`);
    console.log(`Found ${applicants.length} total records`);

    let decryptionFailures = 0;
    const matches = applicants.filter(applicant => {
      try {
        if (!applicant.name) {
          console.log('Record missing name field:', applicant._id);
          return false;
        }

        const decryptedName = decryptData(applicant.name);
        if (!decryptedName) {
          console.log('Decryption failed for record:', applicant._id);
          decryptionFailures++;
          return false;
        }

        const isMatch = decryptedName.toLowerCase().includes(name.toLowerCase());
        if (isMatch) {
          console.log('Found matching record:', applicant._id);
        }
        return isMatch;
      } catch (error) {
        console.error('Error processing record:', applicant._id, error);
        decryptionFailures++;
        return false;
      }
    });

    console.log(`Found ${matches.length} matching records`);
    console.log(`Failed to decrypt ${decryptionFailures} records`);

    if (matches.length === 0) {
      if (decryptionFailures > 0) {
        return res.status(206).json({ 
          warning: `Some records (${decryptionFailures}) could not be decrypted. Please verify your encryption key.`,
          error: 'No matching records found'
        });
      }
      return res.status(404).json({ error: 'No matching records found' });
    }

    const matchesWithDecryptedData = matches.map(applicant => {
      const doc = applicant.toObject();
      try {
        const decryptedName = decryptData(doc.name);
        const decryptedEmail = decryptData(doc.email);

        if (!decryptedName || !decryptedEmail) {
          throw new Error('Decryption failed for sensitive data');
        }

        return {
          ...doc,
          decryptedData: {
            name: decryptedName,
            email: decryptedEmail
          }
        };
      } catch (error) {
        console.error('Error decrypting data for record:', doc._id, error);
        return {
          ...doc,
          decryptedData: {
            name: '[Decryption failed]',
            email: '[Decryption failed]'
          },
          error: 'Failed to decrypt sensitive data'
        };
      }
    });

    res.status(200).json({
      results: matchesWithDecryptedData,
      metadata: {
        totalRecords: applicants.length,
        matchingRecords: matches.length,
        decryptionFailures
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search records' });
  }
});

module.exports = router;