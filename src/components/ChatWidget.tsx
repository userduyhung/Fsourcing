import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');

    // Mock bot reply — simple rules
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "I'm here to help! You can ask about suppliers, products, or how to register.";
      if (lower.includes('price')) reply = 'Prices vary by supplier and quantity. Which product are you interested in?';
      if (lower.includes('register') || lower.includes('join')) reply = 'To register, click Join Now (top-right) or go to /join.';
      if (lower.includes('supplier')) reply = 'To become a supplier, go to the supplier registration page. Do you want me to open it for you?';

      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    }, 700);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">Fsourcing Assistant</div>
            <button onClick={() => setOpen(false)} className="text-white">✕</button>
          </div>
          <div className="p-3 h-64 overflow-auto bg-gray-50">
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm">Hi — ask me about products, suppliers, or registration.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={onSubmit} className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-md border border-gray-200 focus:outline-none" />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md">Send</button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} aria-label="Open chat" className="bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center">
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
