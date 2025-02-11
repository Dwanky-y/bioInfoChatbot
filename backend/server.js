const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Testing routes
app.get('/', (req, res) => {
    res.send("I am alive!");
});
app.get('/test', (req, res) => {
    res.send("This is a test");
});

// Conversation history initialization and the system prompt. More conversation to be added.
let chatHistory = [
    {
        role: "system", // System prompt
        content: "You are a AI chatbot that helps people with the website 'Datamonkey', which is a web application for running analysis on evolutionary biology."
    },
]

// Post incoming HTTP request (req) to get the AI response (res)
app.post('/Ai/:UserMessage', async (req, res) => {
    // Getting user message from localhost:{port}
    const userMessage = req.params.UserMessage
    chatHistory.push({ role:"user", content: userMessage}) // add user message to chat history

    // Try getting AI assistant response via Groq API; if successful, add the AI response to chat history and respond.
    try{
        const aiResponse = await getGroqChatCompletion(chatHistory)
        const aiTextResponse = aiResponse.choices[0]?.message?.content || ""
        chatHistory.push({role: "assistant", content: aiTextResponse})
        res.send(aiTextResponse)
    } catch(error) {
        console.error("Error fetching AI response: ", error);
        res.status(500).send("Can't get AI response")
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});