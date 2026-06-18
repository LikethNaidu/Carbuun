import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";

interface AssistantViewProps {
  onSendMessage: (text: string) => Promise<{ reply: string; insights: string[] } | null>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  loading: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  onSendMessage,
  chatHistory,
  setChatHistory,
  loading,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // Add user message to history
    const userMsg: ChatMessage = {
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMsg]);

    const res = await onSendMessage(userText);
    if (res) {
      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: res.reply,
        insights: res.insights,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Suggested Prompts sidebar */}
      <div className="bg-white border-3 border-black p-5 rounded-xl shadow-neo lg:col-span-1 flex flex-col justify-between h-full">
        <div>
          <h3 className="font-display font-bold text-lg mb-3">GreenCoach Tips</h3>
          <p className="text-xs text-gray-500 font-bold mb-4">
            Ask me anything about your carbon footprint! Try clicking these topics to interact:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setInput("How is my travel footprint looking?")}
              className="w-full text-left bg-neoBackground border-3 border-black p-2.5 rounded-lg text-xs font-bold shadow-neoSm hover:bg-neoOrange hover:text-white transition-all text-neoDark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
            >
              <span role="img" aria-label="car icon" className="mr-1">🚗</span> Travel footprint analysis
            </button>
            <button
              onClick={() => setInput("Tips for reducing my home electricity emissions?")}
              className="w-full text-left bg-neoBackground border-3 border-black p-2.5 rounded-lg text-xs font-bold shadow-neoSm hover:bg-neoYellow hover:text-black transition-all text-neoDark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
            >
              <span role="img" aria-label="lightning icon" className="mr-1">⚡</span> Electricity saving advice
            </button>
            <button
              onClick={() => setInput("What impact does my food preference have?")}
              className="w-full text-left bg-neoBackground border-3 border-black p-2.5 rounded-lg text-xs font-bold shadow-neoSm hover:bg-neoGreen hover:text-black transition-all text-neoDark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
            >
              <span role="img" aria-label="meat icon" className="mr-1">🥩</span> Meat vs Plant diet impact
            </button>
            <button
              onClick={() => setInput("Am I exceeding my carbon budget limits?")}
              className="w-full text-left bg-neoBackground border-3 border-black p-2.5 rounded-lg text-xs font-bold shadow-neoSm hover:bg-neoBlue hover:text-white transition-all text-neoDark focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-1"
            >
              <span role="img" aria-label="chart icon" className="mr-1">📊</span> Check budget limits
            </button>
          </div>
        </div>

        <div className="border-t-3 border-dashed border-black pt-3 mt-4 text-xs font-bold text-gray-400">
          <span role="img" aria-label="sprout icon" className="mr-1">🌱</span> Powered by GreenGuide AI engine, reasoning contextually based on your profile input.
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border-3 border-black rounded-xl shadow-neo lg:col-span-3 flex flex-col justify-between h-full overflow-hidden">
        {/* Chat Header */}
        <div className="bg-neoDark text-white p-4 border-b-3 border-black flex items-center gap-3">
          <div className="text-2xl bg-neoGreen p-1.5 rounded-lg border-2 border-white"><span role="img" aria-label="robot icon">🤖</span></div>
          <div>
            <h3 className="font-display font-bold">GreenGuide AI Assistant</h3>
            <p className="text-xs text-neoGreen font-bold">Online • Ready to Coach</p>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-neoBackground space-y-4" aria-live="polite" aria-relevant="additions">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <span className="text-5xl mb-3" role="img" aria-label="speech balloon">💬</span>
              <h4 className="font-display font-bold text-lg mb-1">Start a Conversation</h4>
              <p className="text-xs text-gray-500 font-bold max-w-xs">
                Greetings! Ask me questions, and I will reason dynamically using your footprint stats.
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] border-3 border-black p-3.5 rounded-xl shadow-neoSm ${
                      isUser
                        ? "bg-neoBlue text-white rounded-br-none"
                        : "bg-white text-neoDark rounded-bl-none"
                    }`}
                  >
                    <p className="font-bold text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>
                    
                    {/* Insights tag (for assistant response) */}
                    {!isUser && msg.insights && msg.insights.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-gray-200 pt-2">
                        {msg.insights.map((insight, idx) => (
                          <span
                            key={idx}
                            className="bg-neoYellow text-black border-2 border-black text-[10px] px-1.5 py-0.5 rounded font-bold"
                          >
                            <span role="img" aria-label="idea icon" className="mr-1">💡</span> {insight}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-[10px] mt-1.5 text-right font-semibold ${isUser ? "text-blue-100" : "text-gray-400"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-3 border-black p-3 rounded-xl rounded-bl-none shadow-neoSm max-w-[80%]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-neoGreen rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-neoYellow rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-neoBlue rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="p-3 border-t-3 border-black bg-white flex gap-3">
          <input
            type="text"
            value={input}
            aria-label="Sustainability question"
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your sustainability question..."
            className="flex-1 border-3 border-black p-2.5 rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2 focus:bg-yellow-50 font-bold"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-neoGreen text-black border-3 border-black font-display font-bold px-5 py-2.5 rounded-lg shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neoLg transition-all active:translate-x-0 active:translate-y-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Send →
          </button>
        </form>
      </div>
    </div>
  );
};
