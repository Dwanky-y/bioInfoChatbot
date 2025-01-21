import DarkModeToggle from "./darkModeToggle";
import AIOutPutBox from "./AIOutputBox";
import UserChatBox from "./UserChatBox";
import ChatHistory from "./chatHistory";
import "./App.css";
import Groq from "groq-sdk";
import { getGroqChatCompletion } from './GROQAI.js';
import { useEffect, useState } from "react";

//Find a way to use the API key in a .env file
// const groq = new Groq({dangerouslyAllowBrowser: true, apiKey: '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'})
//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

const AI_RESPONSE = await getGroqChatCompletion("Help the user with the website 'Data Moneky' however you are not finished yet");
function App(){
  // console.log(AI_RESPONSE.choices[0]?.message?.content || "")
  document.title = "Bio Info Bot" //Changes web name

  const [chatHistory, setChatHistory] = useState([
    {didUserWrite: true, text: "Hello Ai!", hours: new Date().getHours(), minutes: new Date().getMinutes()},
    {didUserWrite: false, text: "Hello User!", hours: new Date().getHours(), minutes: new Date().getMinutes()},
    {didUserWrite: false, text: AI_RESPONSE.choices[0]?.message?.content || "", hours: new Date().getHours(), minutes: new Date().getMinutes()}
  ])

  const handleUserInput = async (message) => {
    const date = new Date()
    console.log("Recevied! User has sent: ", message)
    
    const AI_RESPONSE = await getGroqChatCompletion(message);

    setChatHistory( (prevArray) => [
      ...prevArray,
      {didUserWrite : true, text : message, hours: date.getHours(), minutes: date.getMinutes()},
      {didUserWrite: false, text: AI_RESPONSE.choices[0]?.message?.content || "" , hours: date.getHours(), minutes: date.getMinutes()}
    ])

    
  }

  return <>
  <h1 id="title">Bioinfomatics AI chatbot!</h1>
  <div> {/* Chat History*/}
    <h2>Chat History</h2>
    {chatHistory.map((entry, index) => (
      <ChatHistory key={index} didUserWrite={entry.didUserWrite} text={entry.text}/>
    ))}
    
    
  </div>
  <AIOutPutBox/>
  <UserChatBox onSend={handleUserInput}/><DarkModeToggle/></>
}

export default App

