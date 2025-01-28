const Groq = require('groq-sdk');
const fetch = require('node-fetch');

// Find a way to use the API key in a .env file
require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(userMessage) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: userMessage
            }
        ],
        model: "llama3-8b-8192"
    });
}

module.exports = { getGroqChatCompletion };