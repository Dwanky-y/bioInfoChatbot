
const express = require('express')
const cors = require('cors')
const app = express();
const port = 5000

//Middleware
app.use(cors())
app.use(express.json())

//Routes
app.get('/', (req, res) =>{
    res.send("I am alive!")
})

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.userMessage;
    
})