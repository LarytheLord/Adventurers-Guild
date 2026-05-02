'use client';

import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi 👋 How can I help you?' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    

    // Fake bot response (replace with API later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Got it! We will help you soon 🚀' },
      ]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white px-4 py-3 rounded-full shadow-lg"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 text-white font-semibold">
            Support Chat
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm ${
                  msg.role === 'user'
                    ? 'text-right text-orange-400'
                    : 'text-slate-300'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-md text-sm outline-none"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-orange-500 px-3 py-2 rounded-md text-white text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}