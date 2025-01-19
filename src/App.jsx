import DarkModeToggle from "./darkModeToggle";
import AIOutPutBox from "./AIOutputBox";
import UserChatBox from "./UserChatBox";
import ChatHistory from "./chatHistory";
import { useEffect, useState } from "react";

function App(){
  document.title = "Bio Info Bot" //Changes web name
  
  const [chatHistory, setChatHistory] = useState([
    ChatHistory({didUserWrite : true, text : "Hello World!"}),
    ChatHistory({didUserWrite : false, text : "Hello User!"})
  ])

  const handleUserInput = (message) => {

    console.log("Recevied! User has sent: ", message)
    setChatHistory( (prevArray) => {
      prevArray,
      chatHistory({didUserWrite : true, text : message})
    })
  }


  return <>
  
  <div> {/* Chat History*/}
    <h2>Chat History</h2>
    {chatHistory}
    
    
  </div>
  <AIOutPutBox/>
  <UserChatBox onSend={handleUserInput}/><DarkModeToggle/></>
}

export default App

