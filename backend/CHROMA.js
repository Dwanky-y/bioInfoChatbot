//Chroma
//https://huggingface.co/Xenova/all-MiniLM-L6-v2
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const { pipeline } = require("@huggingface/transformers")

// async function createVectorStorage() {

// }

async function createTransformer() {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); 

    return extractor
}



async function createVector(sentences) {
    //embedding model / sentence transformer
    // const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'); 
    const extractor = await createTransformer()
    // const sentences = ['A document about human cells', 
    //     'A document about highschool biology', 
    //     'Spongebob lives under the sea']

    const output = await extractor(sentences, {pooling: 'mean', normalize: true});
    console.log(output.tolist())
}

module.exports = { createVector };