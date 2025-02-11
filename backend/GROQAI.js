const Groq = require('groq-sdk');
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // API key is stored in the .env file

async function getGroqChatCompletion(chatHistory) {
    return groq.chat.completions.create({
            messages: chatHistory, // AI memory which is initialized with system prompt
            model: "llama3-8b-8192"
    });
}

module.exports = { getGroqChatCompletion };