const { ChatGroq } = require("@langchain/groq")
const { createVector } = require("./CHROMA")

// Find a way to use the API key in a .env file
require("dotenv").config();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const doc1 = {pageContent: "A document about human cells", metadata: {baz: "bar"}}
// ['A document about human cells', 
//     'A document about highschool biology', 
//     'Spongebob lives under the sea']
createVector(['A document about human cells', 
    'A document about highschool biology',
    'Spongebob lives under the sea',
    'A document about Minh-erals'])

const GROQ = new ChatGroq({
    model: "llama3-8b-8192",
    temperature: .3,
    apiKey: process.env.GROQ_API_KEY
})

async function getGroqChatCompletion(chatHistory) {
    return GROQ.invoke(chatHistory)
}

module.exports = { getGroqChatCompletion };