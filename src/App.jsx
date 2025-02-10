import React, { useState, useEffect } from "react";
import DarkModeToggle from "./darkModeToggle";
import UserChatBox from "./UserChatBox";
import ChatHistory from "./ChatHistory";
import { FiTrash2 } from "react-icons/fi"; // Import trash icon for delete button
import "./App.css";

function App() {
  document.title = "Bio Info Bot";

  // Initialize chats
  const initialChats = JSON.parse(localStorage.getItem("chats")) || {};
  const [chats, setChats] = useState(initialChats);
  const [currentChatId, setCurrentChatId] = useState(Object.keys(chats)[0] || createNewChatId());
  const [chatHistory, setChatHistory] = useState(chats[currentChatId] || []);

  // Helper to generate a new chat ID
  function createNewChatId() {
    return `chat-${Date.now()}`;
  }

  // Sync chats with localStorage
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // Fetch the AI response from your API
  const getAIResponse = async (message) => {
    try {
      const response = await fetch(`http://localhost:5001/Ai/${encodeURIComponent(message)}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Http error! Status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error fetching AI: ", error);
      return "Sorry, something went wrong.";
    }
  };

  // Handle user input and append messages
  const handleUserInput = async (message) => {
    const now = new Date();
    const userMessage = {
      didUserWrite: true,
      text: message,
      hours: now.getHours(),
      minutes: now.getMinutes(),
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);

    // Update chats state
    setChats((prevChats) => ({
      ...prevChats,
      [currentChatId]: updatedHistory,
    }));

    // Fetch AI response
    const AI_RESPONSE = await getAIResponse(message);
    const responseTime = new Date();
    const aiMessage = {
      didUserWrite: false,
      text: AI_RESPONSE,
      hours: responseTime.getHours(),
      minutes: responseTime.getMinutes(),
    };

    const finalHistory = [...updatedHistory, aiMessage];
    setChatHistory(finalHistory);
    setChats((prevChats) => ({
      ...prevChats,
      [currentChatId]: finalHistory,
    }));
  };

  // Handle creating a new chat
  const handleNewChat = () => {
    const newChatId = createNewChatId();
    setCurrentChatId(newChatId);
    setChatHistory([]);
    setChats((prevChats) => ({
      ...prevChats,
      [newChatId]: [],
    }));
  };

  // Handle switching between existing chats
  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    setChatHistory(chats[chatId] || []);
  };

  // Handle deleting a chat
  const handleChatDelete = (chatId) => {
    const updatedChats = { ...chats };
    delete updatedChats[chatId];
    setChats(updatedChats);

    // If the deleted chat is the current one, switch to another chat
    if (currentChatId === chatId) {
      const remainingChatIds = Object.keys(updatedChats);
      if (remainingChatIds.length > 0) {
        setCurrentChatId(remainingChatIds[0]);
        setChatHistory(updatedChats[remainingChatIds[0]]);
      } else {
        const newChatId = createNewChatId();
        setCurrentChatId(newChatId);
        setChatHistory([]);
      }
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
          <button className="new-chat-button" onClick={handleNewChat}>
            + New Chat
          </button>
        </div>
        <div className="sidebar-chats">
          {Object.keys(chats).map((chatId) => (
            <div
              key={chatId}
              className={`chat-item ${chatId === currentChatId ? "active" : ""}`}
              onClick={() => handleChatSelect(chatId)}
            >
              <span>Chat {chatId.split("-")[1]}</span>
              <button
                className="delete-chat-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent switching chats on delete
                  handleChatDelete(chatId);
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <h1>Bio Info Bot</h1>
          <DarkModeToggle />
        </header>

        <section className="chat-history-container">
          {chatHistory.map((entry, index) => (
            <ChatHistory
              key={index}
              didUserWrite={entry.didUserWrite}
              text={entry.text}
              hours={entry.hours}
              minutes={entry.minutes}
            />
          ))}
        </section>

        <footer className="chat-input-container">
          <UserChatBox onSend={handleUserInput} />
        </footer>
      </main>
    </div>
  );
}

export default App;
