import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiUser, FiCpu } from "react-icons/fi"; // Icons for user and AI

// Custom renderer for code blocks and other elements
const renderers = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{
          background: '#000000',
          border: '1px solid #2f2f2f',
          borderRadius: '8px',
          padding: '1rem',
          margin: '1rem 0',
        }}
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
  // Ensure proper rendering of lists
  ul({ children, ...props }) {
    return <ul {...props}>{children}</ul>;
  },
  ol({ children, ...props }) {
    return <ol {...props}>{children}</ol>;
  },
  li({ children, ...props }) {
    return <li {...props}>{children}</li>;
  },
  // Ensure proper rendering of tables
  table({ children, ...props }) {
    return <table {...props}>{children}</table>;
  },
  thead({ children, ...props }) {
    return <thead {...props}>{children}</thead>;
  },
  tbody({ children, ...props }) {
    return <tbody {...props}>{children}</tbody>;
  },
  tr({ children, ...props }) {
    return <tr {...props}>{children}</tr>;
  },
  th({ children, ...props }) {
    return <th {...props}>{children}</th>;
  },
  td({ children, ...props }) {
    return <td {...props}>{children}</td>;
  },
};

const ChatFormat = ({ isUser, text, hours, minutes }) => {
  return (
    <>
      <div className={`chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        {/* Icon based on message type */}
        <div className={`message-icon ${isUser ? "user-icon" : "ai-icon"}`}>
          {isUser ? <FiUser size={16} /> : <FiCpu size={16} />}
        </div>

        {/* Bubble text content */}
        <div className="bubble-container">
          <div className="bubble-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
              {text}
            </ReactMarkdown>
          </div>
          {isUser && (
            <div className="bubble-time">
              {hours}:{minutes < 10 ? `0${minutes}` : minutes}
            </div>
          )}
        </div>
      </div>

      {/* Separator line */}
      <div className="separator-line"></div>
    </>
  );
};

export default ChatFormat;
