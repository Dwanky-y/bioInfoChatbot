//Chroma
//https://huggingface.co/Xenova/all-MiniLM-L6-v2
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { pipeline } = require("@huggingface/transformers");
const { TbVectorTriangle } = require("react-icons/tb");


// async function createVectorStorage() {

// }

async function createTransformer() {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); 
    return extractor
}

const vectorStore = new Chroma(createTransformer, {
    collectionName: "bioinformatics"
})

async function createVector(sentences) {
    //embedding model / sentence transformer
    // const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); 
    const extractor = await createTransformer()
    // const sentences = ['A document about human cells', 
    //     'A document about highschool biology', 
    //     'Spongebob lives under the sea']

    const output = await extractor(sentences, {pooling: 'mean', normalize: true});
    const vectors = output.tolist()
    const IDArry = sentences.map((_, index) => `id_${index + 1}`)

    // await vectorStore.addDocuments(sentences, {
    //     id: IDArry,
    // })

    //add vectors to Chroma 
    await vectorStore.addVectors(vectors, sentences, {
        ids: IDArry
        // ids: ["id1", "id2", "id3"]
    })

    // const results = await vectorStore.similaritySearchVectorWithScore("biology", 3)
    
    // console.log(results)

}

// async function queryChroma(text) {
//     const vectors = await vectorStore.embeddings
// }

module.exports = { createVector };