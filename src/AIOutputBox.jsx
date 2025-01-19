import React, { useState } from "react"

function AIOutPutBox() {

    const [aiText, setAiText] = useState('')

    const displayAIOutput = (message) => {
        let typingSpeed = 25; // typing speed in milliseconds
        let typedMessage = ''
        let index = 0

        const typeLetter = () => {
            if (index < message.length) {
                typedMessage += message[index]
                setAiText(typedMessage)
                index++
                setTimeout(typeLetter, typingSpeed)
            }
        }

        typeLetter()
    }

    return <>
        <h2>AI Output: {aiText}</h2>
        <button onClick={() => displayAIOutput("This is a typing test")}>Test Output</button>
    </>
}

export default AIOutPutBox