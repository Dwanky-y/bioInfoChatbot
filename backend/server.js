

// Importing required modules
const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const RecursiveCharacterTextSplitter = require('langchain/text_splitter').RecursiveCharacterTextSplitter;
const Chroma = require('@langchain/community/vectorstores/chroma').Chroma;

const app = express();
const port = 5001;

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

// Embedding model loading
async function loadModel(userMessage, documents) {
    try {
        // Dynamic import of the pipeline function; an ES module cannot be imported using require().
        const { cos_sim, pipeline } = await import('@xenova/transformers');

        // Embedding model loading
        const extractor = await pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5', {
            use_gpu: true, // Enable WebGPU if available
        });

        // [DOCUMENTS] Compute sentence embeddings.
        const documentArray = documents.map(doc => doc.text);
        const embeddings = await extractor(documentArray, { pooling: 'mean', normalize: true, batch_size: 4 });
        
        // [USER QUERY] Prepend recommended query instruction for retrieval.
        const query_prefix = 'Represent this sentence for searching relevant passages: '
        const query = query_prefix + userMessage;
        const query_embeddings = await extractor(query, { pooling: 'mean', normalize: true });
        
        // [GET MOST RELEVANT DOCUMENT FOR THE QUERY] Sort query by cosine similarity score.
        const scores = embeddings.tolist().map(
            (embedding, i) => ({
                id: i,
                score: cos_sim(query_embeddings.data, embedding),
                content: documents[i],
            })
        ).sort((a, b) => b.score - a.score);
        console.log(scores);

    } catch (error) {
        console.error('Error loading model:', error);
    }
}

app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request
    documents = await loadDocuments('./data/datamonkey-both/')
    loadModel(userMessage,documents);
    
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