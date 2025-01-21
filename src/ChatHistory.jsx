import React, { useState } from "react"



function ChatHistory({didUserWrite, text, timeHour, timeMinutes}){
    
    return <>
    <h3>{timeHour}:{timeMinutes}| {didUserWrite ? "You:" : "AI: "} {text} </h3>
    </>
}

export default ChatHistory