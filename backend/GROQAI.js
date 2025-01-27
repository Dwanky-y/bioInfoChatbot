const Groq = require('groq-sdk');
const fetch = require('node-fetch');

// Find a way to use the API key in a .env file
const groq = new Groq({ apiKey: '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' });

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