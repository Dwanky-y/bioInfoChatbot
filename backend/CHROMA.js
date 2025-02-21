//Chroma
//https://v03.api.js.langchain.com/classes/_langchain_community.vectorstores_chroma.Chroma.html
//https://github.com/ollama/ollama?tab=readme-ov-file
//ollama pull mxbai-embed-large

const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { OllamaEmbeddings } = require("@langchain/ollama")
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const fs = require('fs') //file system
const path = require('path')

const embeddingModel = new OllamaEmbeddings({
    model: "mxbai-embed-large", // Default value
    baseUrl: "http://localhost:11434", // Default value
})

const vectorStore = new Chroma(embeddingModel, {
    collectionName: "bioinformatics",
    url: "http://localhost:8000",
})

async function readandChunkFile( filePath, chunkSize, chunkOverlap ) {
    // try{
       
        //get and read file
        // const absolutePath = path.resolve(filePath)
        const fileData = fs.readFileSync('./documents/doc1.txt', 'utf-8')
        console.log("File content: ", fileData)
        //Chunking File
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize, //The amount of characters we want to split the doc
            chunkOverlap: chunkOverlap// the overlap between chunks in characters
        })

        const chunks = await textSplitter.splitText(fileData)
        console.log("The chunks are: ", chunks)
        //return Chunks
        return chunks
    // } catch (error) {
    //     console.log("Couldn't read or chunk file")
    // }
}

async function createVector(sentences) {
    // console.log("Hello")
    // const vector = await embeddingModel.embedQuery("This is a test")
    const vectors = await embeddingModel.embedDocuments(sentences)

    //Check for duplicate vectors
    const existingVectors = await vectorStore.similaritySearch("", 1000) //gets all documents in the database
    // console.log(existingVectors)
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
            console.log("adding new vector")
            newVectors.push(vector);
            newSentences.push({
                pageContent: sentence,
                metadata: {},
                id: id
            })

            newIds.push(id)
        } else { //duplicate, skipping 
            console.log("Duplicate found! : ", sentence)
        }
    }

    if (newVectors.length > 0) { //add vectors if theres something to add
        await vectorStore.addVectors(newVectors, newSentences, {
            ids: newIds
        })

        console.log("New documents added to vector store!: ", newSentences)
    } else{
        console.log("Nothing new added to vector db")
    }

}

async function chromaSearch(context, nResults) {
    const retriever = vectorStore.asRetriever({
        k: nResults //how many results get printed out
    })
    const results = await retriever.invoke(context) //Searches Chroma for relevant info

    console.log("The results of : ", results)

    return results
}

module.exports = { createVector, chromaSearch, readandChunkFile };