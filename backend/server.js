const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// conversation history
let chatHistory = [
    {
        role: "system", //Admin
        content: "You are a AI chat bot that helps people with the website 'Data Monkey' the website is a bioinfomatics website"
    },
    // { example
        // role: "user",
        // content: "hi"
    // }
]

// Routes
app.get('/', (req, res) => {
    res.send("I am alive!");
});

app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage
    chatHistory.push({ role:"user", content: userMessage}) //add user message to chat history

    try{
        const aiResponse = await getGroqChatCompletion(chatHistory)
        const aiTextResponse = aiResponse.choices[0]?.message?.content || ""
        
        chatHistory.push({role: "assistant", content: aiTextResponse}) // adds ai response to chat history
        res.send(aiTextResponse)

    } catch(error) {
        console.error("Error fetching AI response: ", error);
        res.status(500).send("Can't get AI response")
    }
});

app.get('/test', (req, res) => {
    res.send("This is a test");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});