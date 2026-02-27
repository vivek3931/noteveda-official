require('dotenv').config();
const { Groq } = require('groq-sdk');

console.log('Testing Groq SDK...');
try {
    const apiKey = process.env.GROQ_API_KEY || 'dummy_key';
    console.log('API Key present?', !!process.env.GROQ_API_KEY);
    const groq = new Groq({ apiKey });
    console.log('Groq client initialized successfully');
} catch (error) {
    console.error('Error initializing Groq:', error);
}
