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
        content: 
        "You are an AI chatbot named Bioinformatics Software Tutorial Supporting Chatbot, or BSTS Chatbot.\
        You are an assistant for question-answering tasks.",
    },
    // { example
        // role: "user",
        // content: "hi"
    // }
];

let chatHistory4Log = chatHistory.slice();

let chatHistoryFileName = `chatlog_${new Date().toISOString().replace(/:/g, "_")}.json`;

// Testing routes
app.get('/', (req, res) => {
    res.send("I am alive!");
});
app.get('/test', (req, res) => {
    res.send("This is a test");
});


app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request
    chatHistory.push({ role:"user", content: userMessage}) // add user message to chat history
    chatHistory4Log.push({ role:"user", content: userMessage, date: new Date().toISOString()})
    try{
        const aiResponse = await getGroqChatCompletion(chatHistory)
        const aiTextResponse = aiResponse.choices[0]?.message?.content || "" // get the first response from the AI
        chatHistory.push({role: "assistant", content: aiTextResponse}) // adds ai response to chat history
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
        console.log("Successfully wrote chatHistory");
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});