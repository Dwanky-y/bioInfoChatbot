// Contains functions for ChromaDB vector store and embeddings
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { OllamaEmbeddings } = require("@langchain/ollama")
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const fs = require('fs') // file system
const path = require('path')

const embeddingModel = new OllamaEmbeddings({
    model: "nomic-embed-text", 
    baseUrl: "http://127.0.0.1:11434",
})

const vectorStore = new Chroma(embeddingModel, {
    collectionName: "hyphy",
    url: "http://127.0.0.1:8000",
})


async function readandChunkFile( filePath, chunkSize, chunkOverlap ) {
        // Get and read documents from path
        const fileData = fs.readFileSync(filePath, 'utf-8')
        console.log("CHROMA.js | File start: ", fileData.slice(0, 10))

        // Chunking File
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize, // The amount of characters we want to split the doc
            chunkOverlap: chunkOverlap // the overlap between chunks in characters
        })

        const chunks = await textSplitter.splitText(fileData)
        console.log("CHROMA.js | First 10 chunks are: ", chunks.slice(0, 10))
        return chunks
}

async function createVector(sentences) {
    const vectors = await embeddingModel.embedDocuments(sentences)

    //Check for duplicate vectors
    const existingVectors = await vectorStore.similaritySearch("", 1000) // gets all documents in the database with L2 distance; L2 distance, closer to 0 the better. 
    
    const newVectors = [];
    const newSentences = []
    const newIds = []

    for (let i = 0; i < vectors.length; i++) {
        const vector = vectors[i];
        const sentence = sentences[i];
        const id = `id_${i + 1}`

        const isDuplicate = existingVectors.some(existingVectors => {
            return existingVectors.pageContent === sentence //stops when return true
        })

        if (!isDuplicate) { //if there is NOT a duplicate
            console.log("CHROMA.js | adding new vector")
            newVectors.push(vector);
            newSentences.push({
                pageContent: sentence,
                metadata: {},
                id: id
            })

            newIds.push(id)
        } else { //duplicate, skipping 
            console.log("CHROMA.js | Duplicate found! : ", id)
        }
    }

    if (newVectors.length > 0) { //add vectors if theres something to add
        await vectorStore.addVectors(newVectors, newSentences, {
            ids: newIds
        })

        console.log("CHROMA.js | New documents added to vector store! First Sentence: ", newSentences[0])
    } else{
        console.log("CHROMA.js | Nothing new added to vector db")
    }

}

async function chromaSearch(context, nResults) {
    const threshold = 0.9; // Threshold 0.9, smaller than 0.9 seems to be good for our use case -- otherwise, GenAI models take longer to answer with lower quality results.
    const results = await vectorStore.similaritySearchWithScore(context, nResults);

    // Smaller scores mean *closer matches* (distance metric)
    const filtered = results.filter(([doc, score]) => score < threshold);

    return filtered
}

// Will be available for import in other files, e.g., GROQAI.js
module.exports = { createVector, chromaSearch, readandChunkFile };