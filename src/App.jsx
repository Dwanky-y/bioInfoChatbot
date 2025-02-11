import { useState } from "react";
import "./App.css";
import DarkModeToggle from "./DarkModeToggle";
// import ModelOutPutBox from "./ModelOutputBox"; // A component that displays the
import UserChatBox from "./UserChatBox";
import ChatFormat from "./ChatFormat";
const port = 5001;

function App(){
  // Web application title
  document.title = "BSTS Chatbot"

  // // This is how the AI response can be accessed from the fetch response.
  // console.log(AI_RESPONSE.choices[0]?.message?.content || "") 

  // Initialization of chat history
  const [chatHistory, setChatHistory] = useState(
    [
      { // Initial chatHistory variable
        isUser: true, 
        text: "Hello AI!", 
        hours: new Date().getHours(), 
        minutes: new Date().getMinutes()
      },
      { // A state updater function that updates the chatHistory variable
        isUser: false, 
        text: "Hello User!", 
        hours: new Date().getHours(), 
        minutes: new Date().getMinutes()
      },
    ]
  )

  // AI response fetch function; fetching from http://localhost:${port}/Ai/${encodeURIComponent(message)}
  const getAIResponse = async (message) => {
    try {
      const response = await fetch(`http://localhost:${port}/Ai/${encodeURIComponent(message)}`, {
        method: 'POST' // a post method needs to be declared otherwise it wont work
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
    // // Testing fetch
    // const response = await fetch('/test');
    // const text = await response.text();
    // console.log("text: ", text);
    // return text;
  }

  // User input handler function; this function is called whenever the user sends a message
  const handleUserInput = async (message) => {
    const date = new Date()
    const AI_RESPONSE = await getAIResponse(message)
    console.log("AI_RESPONSE: ", AI_RESPONSE)

    // Updating the chat history with the user message and the AI response
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
    {/* Comment: Essentially writing out chatHistory content. It takes the variable and mapping it to the ChatFormat component for formatting.*/}
    {chatHistory.map((entry, index) => (
      <ChatFormat key={index} 
      isUser={entry.isUser} 
      text={entry.text} 
      hours={entry.hours} 
      minutes={entry.minutes}/>
    ))}
  </div>
  <UserChatBox onSend={handleUserInput}/>
  <p></p>
  <DarkModeToggle/></>
}

export default App

