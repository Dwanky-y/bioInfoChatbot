import React, {useState} from "react"
// Should have a text field and a enter button
function UserChatBox({ onSend }) {

    const [text, setText] = useState('')


    const sendMessage = () => {
        console.log("Sending Message: ", text)
        //API call to LLM here??

        if (onSend) {
            onSend(text)
        }
        setText('')
    }

    const handleKeyDown = (event) =>{
        // console.log("Key Pressed: ", event.key)

        if (event.key === "Enter" ){
            // console.log("Sending Message: ", text)
            sendMessage()
        }
    }

    return <>
    <input type="text" name="userInput" value={text} onChange={(e) => setText(e.target.value)}
    onKeyDown={handleKeyDown}/>
    <button for="userInput" onClick={sendMessage}>Send</button>
    </>

}

export default UserChatBox