import React, { useState } from "react"



function ChatDateTime({isUser, text, hours, minutes}){
    // console.log("The current hour is: ", hours)
    // console.log("The current minute is: ", minutes)
    return <>
    <h3>{hours}:{minutes}| {isUser ? "You:" : "AI: "} {text} </h3>
    </>
}

export default ChatDateTime