//Chroma
const { Chroma } = require("@langchain/community/vectorstores/chroma")
const client = new ChromaClient();

async function createCollection() {
    const collection = await client.getOrCreateCollection({
        name: "bioInformaticsData"
    })

    await collection.upsert ({
        documents: [
            "This document is about human cells",
            "This document is about highschool biology",
            "Spongebob lives under the sea"
        ],
        ids: ["id1", "id2", "id3"],
    })

    // const result = await collection.query({
    //     queryTexts: "A document about life",
    //     nResults: 3
    // })

    // console.log(result)
    // console.log(collection)
    return collection
}


async function queryChroma(text, nResults = 3) {
    const collection = await createCollection()
    // console.log(collection)

    const result = await collection.query({
        queryTexts: text,
        nResults: nResults
    })

    console.log(result)
}

queryChroma("This document is about human cells")
