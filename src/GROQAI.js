import Groq from "groq-sdk";


//Find a way to use the API key in a .env file
const groq = new Groq({dangerouslyAllowBrowser: true, apiKey: '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'})
//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

export async function main() {
    // const chatCompletion = await getGroqChatCompletion()
}

export async function getGroqChatCompletion(userMessage){
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: userMessage
            }
        ],
        model: "llama3-8b-8192"
    })
}