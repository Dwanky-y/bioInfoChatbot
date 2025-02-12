import React, { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi"; // Import only the send icon

function UserChatBox({ onSend }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const sendMessage = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents a new line from being added
      sendMessage();
    }
  };

  // Auto-resize the textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "2rem"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust height dynamically
    }
  }, [text]);

  return (
    <div className="input-box-container">
      {/* Auto-growing text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="chat-input-field"
        rows={1}
        autoComplete="off"
      />

      {/* Send button with an icon */}
      <button className="icon-button send-button" onClick={sendMessage}>
        <FiSend size={20} />
      </button>
    </div>
  );
}

export default UserChatBox;
