const express = require('express');
const cors = require('cors');
const app = express();

const { getGroqChatCompletion } = require('./GROQAI');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const RecursiveCharacterTextSplitter = require('langchain/text_splitter').RecursiveCharacterTextSplitter;
const Chroma = require('@langchain/community/vectorstores/chroma').Chroma;

const port = 5001;
const CHROMA_URL = "http://localhost:8000"; // URL of the running ChromaDB server
const transformer = '@xenova/transformers';
const embedModel = 'Xenova/bge-large-en-v1.5';
const persistDirectory = './chromadb_store/';
const numDimensions = 1024; // Known as 1024 for bge-large-en-v1.5 https://inference.readthedocs.io/en/latest/models/builtin/embedding/bge-large-en-v1.5.html

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
        The users are undergraduate students with computer science background, but you are not an undergraduate student with computer science background.\
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

// Chunking using LangChain's RecursiveCharacterTextSplitter; check the documentation for output structure
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
async function generateEmbeddingExtractor() {
    // Dynamic import of the pipeline function; an ES module cannot be imported using require().
    const { pipeline } = await import(transformer);
    
    const extractor = await pipeline('feature-extraction', embedModel, {
        use_gpu: true, // Enable WebGPU if available
    });

    return extractor;
}

class XenovaEmbeddings {
    constructor(extractor) {
        this.extractor = extractor; // Store the pipeline extractor function
    }

    async embedDocuments(texts) {
        if (!texts || texts.length === 0) {
            throw new Error("🛑 No valid texts provided for embedding.");
        }

        // Extract embeddings
        const output = await this.extractor(texts, { pooling: 'mean', normalize: true, batch_size: 4 });

        // Ensure embeddings are in array format; originally, they are in tensor format.
        if (output && output.dims && output.data) {
            // Reshape flat Float32Array into a 2D array
            const reshapedEmbeddings = [];
            for (let i = 0; i < output.dims[0]; i++) {
                reshapedEmbeddings.push(output.data.slice(i * output.dims[1], (i + 1) * output.dims[1]));
            }

            console.log("Embeddings Shape:", reshapedEmbeddings.length, reshapedEmbeddings[0]?.length); // Debugging

            return reshapedEmbeddings; // Return an array of arrays
        }

        throw new Error("Unexpected embedding format received from extractor.");
    }

    async embedQuery(query) {
        if (!query || typeof query !== "string") {
            throw new Error("Invalid query: must be a non-empty string.");
        }
        console.log("Query:", query);
        // Wrap the single query in an array to use the same embedding function
        const result = await this.embedDocuments([query]);
        return result; // Extract the single query embedding
    }
}


// Store embeddings in ChromaDB
async function storeEmbeddings(docs, extractor, collectionName) {
    // Initialize XenovaEmbeddings class
    const xenovaEmbeddings = new XenovaEmbeddings(extractor);

    // Check the structure of `doc.chunks` from splitter.createDocuments()
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

    // // Debug: Log the valid chunks before embedding
    // console.log("Valid chunks: ", validChunks);

    // Ensure embeddings are generated for each chunk
    try {

        // Now pass the valid documents and reshaped embeddings to Chroma
        const vectorStore = await Chroma.fromDocuments(validChunks, xenovaEmbeddings, {
            numDimensions: numDimensions,
            persist_directory: persistDirectory,
            url: CHROMA_URL,
            collectionName: collectionName,
        });

        // Chroma.fromDocuments() is NOT generating embeddings correctly from xenovaEmbeddings. Manual update...
        // Check existingDocs.ids.length and existingDocs.documents.length. 
        // ChromaDB is preserving all my runs within the same collection name. 
        // The number of ids is increasing by the increment of Embeddings row number after every iteration...
        
        // Step 1: Get the existing collection
        const collection = await vectorStore.index.getCollection({ name: collectionName });

        // Step 2: Get the document IDs (assuming they exist)
        const existingDocs = await collection.get();
        const docIds = existingDocs.ids;  // Extract stored document IDs
        console.log([existingDocs.ids.length, existingDocs.documents.length, existingDocs.metadatas.length ]);

        // Step 3: Generate new embeddings for existing docs
        const newEmbeddings = await xenovaEmbeddings.embedDocuments(existingDocs.documents);
        console.log(newEmbeddings[0]); // Debugging
        console.log([newEmbeddings.length, newEmbeddings[0]?.length]); // Debugging

        // Step 4: Update documents with new embeddings; note that we are updating a collection, not a vector store
        // updating collection in small batches, otherwise ChromaConnectionError
        const batchSize = 100;
        async function updateInBatches(collection, ids, embeddings) {
            for (let i = 0; i < ids.length; i += batchSize) {
                const batchIds = ids.slice(i, i + batchSize);
                const batchEmbeddings = embeddings.slice(i, i + batchSize);
            
                try {
                    // Here, you update the collection with the batch
                    await collection.upsert({
                        ids: batchIds,
                        embeddings: batchEmbeddings,
                    });
                    console.log(`Batch ${Math.floor(i / batchSize) + 1} updated successfully!`);
                } catch (error) {
                    console.error(`Error updating batch ${Math.floor(i / batchSize) + 1}:`, error);
                }
            }
        }
        await updateInBatches(collection, docIds, newEmbeddings);

        console.log("Embeddings stored in ChromaDB!");
        return vectorStore;
    } catch (error) {
        console.error("Error during embeddings generation:", error);
    }
}

// Query the vector store and retrieve relevant results
async function queryChroma(vectorStore, query) {
    const results = await vectorStore.similaritySearch(query, 3);  // Top 3 most relevant chunks
    console.log("Query results:");
    results.forEach(result => {
        console.log(`Text: ${result.text}\nScore: ${result.score}`);
    });
}

// async function loadPersistedVectorStore() {
//     const embeddings = new OpenAIEmbeddings();
  
//     // Load the vector store from the persisted location
//     const vectorStore = await Chroma.load(persistDirectory, embeddings);
//     console.log("Loaded persisted ChromaDB!");
  
//     return vectorStore;
// }

async function processDocuments(folderPath, query) {
    try {
        const documents = await loadDocuments(folderPath);
        const chunkedDocuments = await chunkDocuments(documents);
        const extractor = await generateEmbeddingExtractor(); 

        const vectorStore = await storeEmbeddings(chunkedDocuments, extractor, "test_collection"); // Store embeddings in ChromaDB
        const storedDocs = await vectorStore.collection.get();
        console.log("Stored Documents in ChromaDB:", storedDocs);
        
        // const vectorStore = await Chroma.load(persistDirectory); 

        // Perform the query and retrieve relevant results; Chroma uses its own cos_sim internally so no need to get it from transformers
        await queryChroma(vectorStore, query);
    } catch (error) {
        console.error("Error processing documents:", error);
    }
}

app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request
    const query_prefix = 'Represent this sentence for searching relevant passages: '
    const query = query_prefix + userMessage;
    processDocuments('./data/datamonkey-both/',query);
    
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