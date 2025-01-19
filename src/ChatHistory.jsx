import React, { useState } from "react"

function ChatHistory({didUserWrite, text}){

    return <>
    <h3>{didUserWrite ? "You:" : "AI: "} {text} </h3>
    </>
}

export default ChatHistory