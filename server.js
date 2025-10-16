const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const app = express();
const port = 5001;
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Initialization of chatHistory with a system prompt
let chatHistory = [
    {
        role: "system", // Admin
        content: "You are an AI chatbot named Retrieval-Augmented Bioinformatics Software Tutorial Supporting Chatbot, or RA-BSTS Chatbot.\
        You are an assistant for question-answering tasks.\
        You are helping users with questions related to the HyPhy software, which is a suite of bioinformatics software used for hypothesis testing using phylogenies.\
        If you do not know the answer, say 'I don't know'.\
        "
    },
]

let chatHistory4Log = chatHistory.slice();

let chatHistoryFileName = `chatlog_${new Date().toISOString().replace(/:/g, "_")}.json`;

// Endpoint to handle user messages and get AI responses
app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request
    chatHistory.push({ role:"user", content: userMessage}) // add user message to chat history
    chatHistory4Log.push({ role:"user", content: userMessage, date: new Date().toISOString()})
    try{
        const aiResponse = await getGroqChatCompletion(chatHistory) /////////////////////////////////////////////////
        // const aiTextResponse = aiResponse.content || "" // get the response from the AI

        // Formatting AI response to have line breaks for better readability
        const lineLength = 100; // max characters per line
        const aiTextResponseRaw = aiResponse.content || ""
        // Insert "\n" every `lineLength` characters (you can adjust the number)
        let result = "";
        let lastBreak = 0;

        for (let i = 0; i < aiTextResponseRaw.length; i++) {
            const char = aiTextResponseRaw[i];
            result += char;

            // if a newline appears naturally, reset the counter
            if (char === "\n") {
                lastBreak = i;
            }

            // if we've gone more than lineLength chars since last newline, insert one at a space
            if (i - lastBreak >= lineLength) {
                // look backward for a nearby space to break naturally
                const lastSpace = result.lastIndexOf(" ");
                if (lastSpace !== -1 && lastSpace > lastBreak) {
                result = result.substring(0, lastSpace) + "\n" + result.substring(lastSpace + 1);
                lastBreak = lastSpace;
                } else {
                // if no space, just force-break at current position
                result += "\n";
                lastBreak = i;
                }
            }
        }

        const aiTextResponse = result.trim();

        console.log(aiTextResponse);

        chatHistory.push({role: "assistant", content: aiTextResponse}) // adds ANY response to chat history
        // console.log("server.js | chatHistory: ", chatHistory)
        chatHistory4Log.push({ role:"assistant", content: aiTextResponse, date: new Date().toISOString()})
        res.send(aiTextResponse)
    } catch(error) {
        console.error("Error fetching AI response: ", error);
        res.status(500).send("Can't get AI response")
    }
    const jsonString = JSON.stringify(chatHistory4Log, null, 2); // Convert array to JSON string with indentation
    fs.writeFile(chatHistoryFileName, jsonString, (err) => {
        if (err) {
        console.error("Error writing chatHistory:", err);
        } else {
        console.log("Successfully wrote chatHistory ------------------------");
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});