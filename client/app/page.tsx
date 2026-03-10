"use client";

import { useState, useRef, useEffect } from "react";
import "./style.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Helper to generate a random ID for the thread
const generateId = () => Math.random().toString(36).substring(2, 15);

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: "user" | "ai"; thread_id: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize a new thread when the component mounts
  useEffect(() => {
    const newThreadId = generateId();
    setThreadId(newThreadId);
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: generateId(),
      text: input,
      sender: "user" as const,
      thread_id: threadId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // REQUEST TO THE API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/v1/agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage.text,
            thread_id: threadId,
          }),
        },
      );

      if (!response.ok) throw new Error("API Error");

      // Assuming your API returns a JSON object with a 'response' or 'text' field
      // Adjust this based on your actual API response structure
      const data = await response.json();

      const aiMessage = {
        id: generateId(),
        text: Array.isArray(data.message)
          ? data.message.map((item: any) => item.text).join("")
          : (data.message ??
            "Agent having some trouble, Please try again later"),
        sender: "ai" as const,
        thread_id: threadId,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: generateId(),
        text: "Sorry, I encountered an error connecting to the server.",
        sender: "ai" as const,
        thread_id: threadId,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setThreadId(generateId());
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>AI Assistant</h1>
          <span className="status-indicator">
            <span className="dot"></span> Online
          </span>
        </div>
        <button onClick={handleNewChat} className="new-chat-btn">
          + New Chat
        </button>
      </header>

      {/* Chat Area */}
      <main className="chat-area">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>How can I help you today?</h2>
            <p>Start a conversation with your AI assistant.</p>
          </div>
        )}

        <div className="messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender === "user" ? "user-message" : "ai-message"}`}
            >
              <div className="message-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");

                      if (!inline && match) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        );
                      }

                      return <code className={className} {...props}>{children}</code>;
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble ai-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
