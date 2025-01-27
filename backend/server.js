const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send("I am alive!");
});

app.get('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage
    try{
        const aiResponse = await getGroqChatCompletion(userMessage)
        const aiTextResponse = aiResponse.choices[0]?.message?.content || ""

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