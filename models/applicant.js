const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  education: {
    degree: String,
    branch: String,
    institution: String,
    year: Number
  },
  experience: {
    job_title: String,
    company: String,
  },
  skills: [String],
  summary: String
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);