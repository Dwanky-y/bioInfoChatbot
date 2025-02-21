const { ChatGroq } = require("@langchain/groq")
const { createVector, chromaSearch, readandChunkFile } = require("./CHROMA")

// Find a way to use the API key in a .env file
require("dotenv").config();

// createVector(['A document about human cells', 
//     'A document about highschool biology',
//     'Spongebob lives under the sea',
//     'A document about Minh-erals'])
const GROQ = new ChatGroq({
    model: "llama3-8b-8192",
    temperature: .1, //the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

// chromaSearch("Biology", 1)
//filePath, chunkSize, chunkOverlap
readandChunkFile("./documents/doc1.txt", 150, 50)

async function getGroqChatCompletion(chatHistory) {
    return GROQ.invoke(chatHistory)
}

module.exports = { getGroqChatCompletion };