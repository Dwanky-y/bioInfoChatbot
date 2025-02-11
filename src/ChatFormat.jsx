function ChatFormat({isUser, text, hours, minutes}){
    return <>
    <h3>{hours}:{minutes} | {isUser ? "You:" : "AI: "} {text} </h3>
    </>
}

export default ChatFormat