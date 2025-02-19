const express = require('express');
const router = express.Router();
const { verifyToken, encryptData } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Applicant = require('../models/applicant');

//console.log(process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/enrich', verifyToken, async (req, res) => {
  try {
    const { raw_text } = req.body;

    if (!raw_text) {
      return res.status(400).json({ error: 'No resume text provided' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Extract information from the following resume text and return ONLY a JSON object without any additional text, markdown formatting, or code block indicators. The response should be a valid JSON object that can be parsed:
      
      Resume text: "${raw_text}"
      
      Return exactly this structure (fill in the values from the resume):
      {
        "name": "",
        "email": "",
        "education": {
          "degree": "",
          "branch": "",
          "institution": "",
          "year": null
        },
        "experience": {
          "job_title": "",
          "company": ""
        },
        "skills": [],
        "summary": ""
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let parsedData;
    
    try {
      const cleanResponse = response.text().replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Parsing error:', parseError);
      return res.status(500).json({ error: 'Failed to parse resume data' });
    }

    if (parsedData.name) {
      parsedData.name = encryptData(parsedData.name);
    }
    if (parsedData.email) {
      parsedData.email = encryptData(parsedData.email);
    }

    // save to mongodb
    const applicant = new Applicant(parsedData);
    await applicant.save();

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

module.exports = router;