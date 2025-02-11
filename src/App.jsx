import { useState } from "react";
import "./App.css";
import DarkModeToggle from "./DarkModeToggle";
// import ModelOutPutBox from "./ModelOutputBox"; // A component that displays the
import UserChatBox from "./UserChatBox";
import ChatDateTime from "./ChatDateTime";


function App(){
  // Web application title
  document.title = "BSTS Chatbot"

  // This is how the AI response can be accessed from the fetch response.
  // console.log(AI_RESPONSE.choices[0]?.message?.content || "") 

  // Initialization of chat history
  const [chatHistory, setChatHistory] = useState(
    [
    {isUser: true, 
      text: "Hello AI!", 
      hours: new Date().getHours(), 
      minutes: new Date().getMinutes()},
    {isUser: false, 
      text: "Hello User!", 
      hours: new Date().getHours(), 
      minutes: new Date().getMinutes()},
  ]
)

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
      ...prevArray, // append the previous array
      {isUser : true, 
        text : message, 
        hours: date.getHours(), 
        minutes: date.getMinutes()},
      {isUser: false, 
        text: AI_RESPONSE, 
        hours: date.getHours(), 
        minutes: date.getMinutes()}
    ])

    
  }

  return <>
  <h1 id="title">BSTS AI Chatbot</h1>
  <div> 
    <h2>Chat History</h2>
    {/* Comment: Taking the chatHistory variable and mapping it to the ChatDateTime component for formatting*/}
    {chatHistory.map((entry, index) => (
      <ChatDateTime key={index} 
      isUser={entry.isUser} 
      text={entry.text} 
      hours={entry.hours} 
      minutes={entry.minutes}/>
    ))}
  </div>
  <UserChatBox onSend={handleUserInput}/>
  <DarkModeToggle/></>
}

export default App

