const { ChatGroq } = require("@langchain/groq")

// Find a way to use the API key in a .env file
require("dotenv").config();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GROQ = new ChatGroq({
    model: "llama3-8b-8192",
    temperature: .3,
    apiKey: process.env.GROQ_API_KEY
})

async function getGroqChatCompletion(chatHistory) {
    return GROQ.invoke(chatHistory)
}

module.exports = { getGroqChatCompletion };