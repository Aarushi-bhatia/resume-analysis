# Resume Analysis API

API for resume analysis with secure authentication and data encryption.

## Features
- JWT Authentication
- Resume text analysis using Gemini AI
- Encrypted data storage
- Name-based search functionality

## API Endpoints

### 1. Login
```http
POST /api/auth/login
{
    "username": "your_username",
    "password": "your_password"
}
```

### 2. Resume Analysis
```http
POST /api/resume/enrich
Authorization: <token>
{
    "raw_text": "Resume content..."
}
```

### 3. Search
```http
POST /api/search/name
Authorization: <token>
{
    "name": "Search term"
}
```

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CRYPTO_SECRET=your_crypto_secret
GEMINI_API_KEY=your_gemini_api_key
```

3. Start server:
```bash
npm start
```

## Author
Aarushi Bhatia