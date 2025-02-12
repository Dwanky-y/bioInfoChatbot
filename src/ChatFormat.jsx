import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiUser, FiCpu } from "react-icons/fi"; // Import icons for user and AI

const renderers = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={materialDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

const ChatFormat = ({ isUser, text, hours, minutes }) => {
  return (
    <>
      <div className={`chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        {/* Icon based on message type */}
        <div className={`message-icon ${isUser ? "user-icon" : "ai-icon"}`}>
          {isUser ? <FiUser /> : <FiCpu />}
        </div>

        {/* Bubble text content */}
        <div className="bubble-container">
          <div className="bubble-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
              {text}
            </ReactMarkdown>
          </div>
          <div className="bubble-time">
            {hours}:{minutes < 10 ? `0${minutes}` : minutes}
          </div>
        </div>
      </div>

      {/* Separator line */}
      <div className="separator-line"></div>
    </>
  );
};

export default ChatFormat;
