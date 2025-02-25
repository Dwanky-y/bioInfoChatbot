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

async function RAG(chatHistory, context) {
    const promptTemplate =  `Please answer the question with the given context if applicable to the question!
                        Context: "${context.map((item) => `"${item.pageContent}", `)}" 
                        Question: ${chatHistory[chatHistory.length - 1].content}
                        Chat History: ${chatHistory.map((item) => `"${item.role}: ${item.content}", `)}`

    
    return promptTemplate
}


// chromaSearch("Biology", 1)
//filePath, chunkSize, chunkOverlap

async function addChunkedFileToChroma() {
    const chunkedFile = await readandChunkFile("./documents/doc1.txt", 150, 50)
    createVector(await chunkedFile)
}

// addChunkedFileToChroma()

async function getGroqChatCompletion(chatHistory) {
    const context = await chromaSearch(chatHistory[chatHistory.length - 1].content, 3)
    // console.log("Results: " , context)
    const prompt = await RAG(chatHistory, context)
    console.log("Prompt: ", prompt)
    return GROQ.invoke(prompt)
}

module.exports = { getGroqChatCompletion };