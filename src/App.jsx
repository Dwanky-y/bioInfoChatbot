import DarkModeToggle from "./darkModeToggle";
import AIOutPutBox from "./AIOutputBox";
import UserChatBox from "./UserChatBox";
import ChatHistory from "./chatHistory";
import { useEffect, useState } from "react";

function App(){
  document.title = "Bio Info Bot" //Changes web name
  
  const [chatHistory, setChatHistory] = useState([
    {didUserWrite: true, text: "Hello Ai!"},
    {didUserWrite: false, text: "Hello User!"}
  ])

  const handleUserInput = (message) => {

    console.log("Recevied! User has sent: ", message)
    setChatHistory( (prevArray) => [
      ...prevArray,
      {didUserWrite : true, text : message}
    ])
  }


  return <>
  
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

