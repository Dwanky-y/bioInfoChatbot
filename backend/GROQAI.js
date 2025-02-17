const Groq = require('groq-sdk');
const fetch = require('node-fetch');

// Find a way to use the API key in a .env file
require("dotenv").config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(chatHistory) {
    return groq.chat.completions.create({

            messages: chatHistory, //AI Memory
            model: "llama3-8b-8192" // 70B parameter model for chat completion
    });
}

module.exports = { getGroqChatCompletion };