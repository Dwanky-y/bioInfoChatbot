import DarkModeToggle from "./DarkModeToggle";
import AIOutPutBox from "./AIOutputBox";
import UserChatBox from "./UserChatBox";
import ChatHistory from "./ChatHistory";
import "./App.css";
import { useEffect, useState } from "react";

function App(){
  // console.log(AI_RESPONSE.choices[0]?.message?.content || "")
  document.title = "Bioinfo Chatbot" //Changes web name


  const [chatHistory, setChatHistory] = useState([
    {didUserWrite: true, text: "Hello Ai!", hours: new Date().getHours(), minutes: new Date().getMinutes()},
    {didUserWrite: false, text: "Hello User!", hours: new Date().getHours(), minutes: new Date().getMinutes()},
    // {didUserWrite: false, text: AI_RESPONSE.choices[0]?.message?.content || "", hours: new Date().getHours(), minutes: new Date().getMinutes()}
  ])

  const getAIResponse = async (message) => {
    
    try {
      const response = await fetch(`http://localhost:5001/Ai/${encodeURIComponent(message)}`, {
        method: 'POST' //a post method needs to be declared otherwise it wont work
      })
      
      if (!response.ok) {
        throw new Error(`Http error! Status: ${response.status}`)
      }
      const data = await response.text()
      console.log("data: ", data)
      return data
      
    } catch(error) {
      console.error("Error fetching AI: ", error)
    }
    
    // const response = await fetch('/test');
    // const text = await response.text();
    // console.log("text: ", text);
    // return text;
  }

  const handleUserInput = async (message) => {
    const date = new Date()
    console.log(date.getMinutes())
    console.log("Recevied! User has sent: ", message)
    
    // const AI_RESPONSE = await getGroqChatCompletion(message);
    // const AI_MESSAGE = AI_RESPONSE.choices[0]?.message?.content || ""
    const AI_RESPONSE = await getAIResponse(message)
    console.log("AI_RESPONSE: ", AI_RESPONSE)

    setChatHistory( (prevArray) => [
      ...prevArray,
      {didUserWrite : true, text : message, hours: date.getHours(), minutes: date.getMinutes()},
      {didUserWrite: false, text: AI_RESPONSE, hours: date.getHours(), minutes: date.getMinutes()}
    ])

    
  }

  return <>
  <h1 id="title">Bioinfomatics AI chatbot!</h1>
  <div> {/* Chat History*/}
    <h2>Chat History</h2>
    {chatHistory.map((entry, index) => (
      <ChatHistory key={index} didUserWrite={entry.didUserWrite} text={entry.text} hours={entry.hours} minutes={entry.minutes}/>
    ))}
    
    
  </div>
  <AIOutPutBox/>
  <UserChatBox onSend={handleUserInput}/><DarkModeToggle/></>
}

export default App

