const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const RecursiveCharacterTextSplitter = require('langchain/text_splitter').RecursiveCharacterTextSplitter;
const Chroma = require('@langchain/community/vectorstores/chroma').Chroma;
const CHROMA_URL = "http://localhost:8000"; // URL of the running ChromaDB server

const app = express();
const port = 5001;
const transformer = '@xenova/transformers';
const embedModel = 'Xenova/bge-large-en-v1.5';
const numDimensions = 1024; // Known as 1024 for bge-large-en-v1.5 https://inference.readthedocs.io/en/latest/models/builtin/embedding/bge-large-en-v1.5.html
const persistDirectory = './chromadb_store/'

// Middleware
app.use(cors());
app.use(express.json());

// Initialization of chatHistory with a system prompt
let chatHistory = [
    {
        role: "system",
        content: 
        "You are an AI chatbot named Bioinformatics Software Tutorial Supporting Chatbot, or BSTS Chatbot.\
        You are an assistant for question-answering tasks. \
        You are helping users with a website Datamonkey (https://datamonkey.org/), which is a web-based graphical user interface for Hypothesis Testing using Phylogenies (HyPhy).\
        \
        The users are undergraduate students with computer science background, but you are not the undergraduate student with computer science background.\
        \
        Provide examples when explaining concepts. Use examples that the users are likely familiar with.\
        Use a step-by-step guidance when applicable.\
        \
        Use the following pieces of retrieved context given within delimiters to answer the user's questions. \
        \
        \
        If you don't know the answer, just say that you don't know.\
        Before answering the question, verify information in each step and indicate parts that cannot be verified.\
        Only generate answers using facts. If guessing cannot be avoided, say that it is a prediction.\
        If the user's question is ambiguous, ask to clarify. Also, ask to the user to provide details or context if needed.\
        Do not provide unverified answers with confidence, and provide evidence when needed.\
        For each of your answers, if you have reference or evidence, show a summary of such information.\
        \
        "
    },
    // { example
        // role: "user",
        // content: "hi"
    // }
]

// Load documents from folder (TXT and PDF)
async function loadDocuments(folderPath) {
    const files = fs.readdirSync(folderPath);
    const documents = [];

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        let text = '';

        if (/(\.txt|\.jsx)$/.test(file)) {
            text = fs.readFileSync(filePath, 'utf-8');
        } else if (file.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
        } else {
            continue; // Skip unsupported files
        }

        documents.push({ filename: file, text });
    }

    return documents;
}

// Chunking using LangChain's RecursiveCharacterTextSplitter
async function chunkDocuments(documents) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,   // Max tokens per chunk
        chunkOverlap: 50, // Overlap for preserving context
    });

    for (const doc of documents) {
        doc.chunks = await splitter.createDocuments([doc.text]);
    }

    return documents;
}

// Generate Embeddings using Xenova
async function generateEmbeddings(documents) {
    // Dynamic import of the pipeline function; an ES module cannot be imported using require().
    const { cos_sim, pipeline } = await import(transformer);
    
    const extractor = await pipeline('feature-extraction', embedModel, {
        use_gpu: true, // Enable WebGPU if available
    });

    for (const doc of documents) {
         // Check the structure of `doc.chunks` from splitter.createDocuments()
         const textChunks = doc.chunks
         .filter(chunk => typeof chunk.pageContent === "string" && chunk.pageContent.trim().length > 0) // Remove undefined/null
         .map(chunk => chunk.pageContent.trim()); // Ensure clean strings

        if (textChunks.length === 0) {
            console.warn("⚠️ No valid text chunks found for a document:", doc);
            continue; // Skip if there are no valid text chunks
        }

        // Call extractor
        doc.embeddings = await extractor(textChunks, { 
            pooling: 'mean', 
            normalize: true, 
            batch_size: 4 
        });

        console.log("✅ Generated embeddings for document:", doc.filename);
    }

    return [ documents, extractor ];
}

class XenovaEmbeddings {
    constructor(extractor) {
        this.extractor = extractor; // Store the pipeline extractor function
    }

    async embedDocuments(texts) {
        if (!texts || texts.length === 0) {
            throw new Error("No valid texts provided for embedding.");
        }

        // Extract embeddings
        const output = await this.extractor(texts, { pooling: 'mean', normalize: true, batch_size: 4 });

        // Ensure embeddings are in array format
        if (output && output.dims && output.data) {
            // Reshape flat Float32Array into a 2D array
            const reshapedEmbeddings = [];
            for (let i = 0; i < output.dims[0]; i++) {
                reshapedEmbeddings.push(output.data.slice(i * output.dims[1], (i + 1) * output.dims[1]));
            }

            console.log("Final Embeddings Shape:", reshapedEmbeddings.length, reshapedEmbeddings[0]?.length); // Debugging

            return reshapedEmbeddings; // Return an array of arrays
        }

        throw new Error("Unexpected embedding format received from extractor.");
    }
}


// Store embeddings in ChromaDB
async function storeEmbeddings(docs, extractor) {
    console.log(docs)
    // console.log(docs.flatMap(doc => doc.chunks.map((chunk, i) => ({
    //     text: chunk.pageContent,  // Ensure we're storing the actual content of each chunk
    //     vector: doc.embeddings[i], // Embedding corresponding to chunk
    //     metadata: { filename: doc.filename, chunk_index: i },
    // }))))
    // // Check the structure of `doc.chunks` from splitter.createDocuments()
    // const textChunks = doc.chunks
    // .filter(chunk => typeof chunk.pageContent === "string" && chunk.pageContent.trim().length > 0) // Remove undefined/null
    // .map(chunk => chunk.pageContent.trim()); // Ensure clean strings

    const xenovaEmbeddings = new XenovaEmbeddings(extractor);
    // const vectorStore = await Chroma.fromDocuments(
    //     docs.flatMap(doc => doc.chunks
    //         .filter(chunk => typeof chunk.pageContent === "string" && chunk.pageContent.trim().length > 0) // Remove undefined/null
    //         .map(chunk => chunk.pageContent.trim())),
    //     xenovaEmbeddings,
    //     { numDimensions: numDimensions, persist_directory: persistDirectory },
    // );

    const validChunks = docs.flatMap(doc =>
        doc.chunks
            .filter(chunk => typeof chunk.pageContent === "string" && chunk.pageContent.trim().length > 0)  // Only valid text
            .map((chunk, i) => ({
                pageContent: chunk.pageContent.trim(), // Ensure clean text
                metadata: { filename: doc.filename, chunk_index: i } // Add metadata (filename and chunk index)
            }))
    );

    if (validChunks.length === 0) {
        console.warn("No valid text found for embedding.");
        return; // Handle this case accordingly
    }

    // Debug: Log the valid chunks before embedding
    console.log("Valid chunks: ", validChunks);

    // Ensure embeddings are generated for each chunk
    try {


        const embeddings = await xenovaEmbeddings.embedDocuments(validChunks.map(doc => doc.pageContent));
        // Debug: Log the embeddings to inspect the result
        console.log("Raw embeddings returned:", embeddings);

        // Check if embeddings are an array and match the length of valid chunks
        if (!Array.isArray(embeddings) || embeddings.length !== validChunks.length) {
            console.error(`Failed to generate valid embeddings. Expected an array with ${validChunks.length} embeddings but got:`, embeddings);
            return;
        }
        
        console.log("Embeddings generated successfully:", embeddings.length);

        // Now pass the valid documents and reshaped embeddings to Chroma
        const vectorStore = await Chroma.fromDocuments(validChunks, xenovaEmbeddings, {
            numDimensions: numDimensions,
            persist_directory: persistDirectory,
            url: CHROMA_URL,
            collectionName: "my_collection",
        });

        // // **Connect to ChromaDB server**
        // const vectorStore = new Chroma({
        //     collectionName: "my_collection",
        //     url: CHROMA_URL, // Connect to remote ChromaDB
        //     numDimensions: numDimensions, // Set dimensions correctly
        // });

        // **Store embeddings**
        // await vectorStore.addDocuments(validChunks, embeddings);

        console.log("Embeddings stored in ChromaDB!");
        return vectorStore;
    } catch (error) {
        console.error("Error during embeddings generation:", error);
    }
}

// async function loadPersistedVectorStore() {
//     const embeddings = new OpenAIEmbeddings();
  
//     // Load the vector store from the persisted location
//     const vectorStore = await Chroma.load(persistDirectory, embeddings);
//     console.log("Loaded persisted ChromaDB!");
  
//     return vectorStore;
// }

// // Embedding model loading
// async function loadModel(userMessage, documents) {
//     try {
//         // Dynamic import of the pipeline function; an ES module cannot be imported using require().
//         const { cos_sim, pipeline } = await import('@xenova/transformers');

//         // Embedding model loading
//         const extractor = await pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5', {
//             use_gpu: true, // Enable WebGPU if available
//         });

//         // [DOCUMENTS] Compute sentence embeddings.
//         const documentArray = documents.map(doc => doc.text);
//         const embeddings = await extractor(documentArray, { pooling: 'mean', normalize: true, batch_size: 4 });
        
//         // [USER QUERY] Prepend recommended query instruction for retrieval.
//         const query_prefix = 'Represent this sentence for searching relevant passages: '
//         const query = query_prefix + userMessage;
//         const query_embeddings = await extractor(query, { pooling: 'mean', normalize: true });
        
//         // [GET MOST RELEVANT DOCUMENT FOR THE QUERY] Sort query by cosine similarity score.
//         const scores = embeddings.tolist().map(
//             (embedding, i) => ({
//                 id: i,
//                 score: cos_sim(query_embeddings.data, embedding),
//                 text: documents[i],
//             })
//         ).sort((a, b) => b.score - a.score);
//         console.log(scores);

//     } catch (error) {
//         console.error('Error loading model:', error);
//     }
// }

app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request


    const documents = await loadDocuments('./data/datamonkey-both/');
    const chunkedDocuments = await chunkDocuments(documents);
    const [ docsWithEmbeddings, extractor ] = await generateEmbeddings(chunkedDocuments);

    const vectorStore = await storeEmbeddings(docsWithEmbeddings, extractor); // Store embeddings in ChromaDB
    // const vectorStore = await Chroma.load(persistDirectory); 

    console.log(vectorStore)

    // loadModel(userMessage,chunkedDocuments);
    
    chatHistory.push({ role:"user", content: userMessage}) // add user message to chat history
    try{
        const aiResponse = await getGroqChatCompletion(chatHistory)
        const aiTextResponse = aiResponse.choices[0]?.message?.content || "" // get the first response from the AI
        chatHistory.push({role: "assistant", content: aiTextResponse}) // adds ai response to chat history
        res.send(aiTextResponse)
    } catch(error) {
        console.error("Error fetching AI response: ", error);
        res.status(500).send("Can't get AI response")
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});