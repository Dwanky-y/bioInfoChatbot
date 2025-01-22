import React, { useState } from "react"



function ChatHistory({didUserWrite, text, hours, minutes}){
    // console.log("The current hour is: ", hours)
    // console.log("The current minute is: ", minutes)
    return <>
    <h3>{hours}:{minutes}| {didUserWrite ? "You:" : "AI: "} {text} </h3>
    </>
}

export default ChatHistory