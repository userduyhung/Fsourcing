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

    // Phản hồi bot mô phỏng
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "Tôi sẵn sàng hỗ trợ bạn! Bạn có thể hỏi về nhà cung cấp, sản phẩm hoặc cách đăng ký.";
      if (lower.includes('giá')) reply = 'Giá sẽ thay đổi theo nhà cung cấp và số lượng. Bạn quan tâm đến sản phẩm nào?';
      if (lower.includes('đăng ký') || lower.includes('tham gia')) reply = 'Để đăng ký, hãy nhấn Đăng ký (góc trên bên phải) hoặc truy cập /join.';
      if (lower.includes('nhà cung cấp')) reply = 'Để trở thành nhà cung cấp, hãy vào trang đăng ký nhà cung cấp. Bạn có muốn tôi mở trang đó cho bạn không?';

      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    }, 700);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {open ? (
        <div className="w-80 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col font-sans">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between font-sans">
            <div className="font-semibold font-sans">Trợ lý Fsourcing</div>
            <button onClick={() => setOpen(false)} className="text-white">×</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-sans" style={{ maxHeight: 320 }}>
            {messages.length === 0 ? (
              <div className="text-gray-500 text-sm font-sans">Chào bạn! Hãy đặt câu hỏi để được hỗ trợ.</div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`mb-2 flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm font-sans ${m.from === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={onSubmit} className="flex border-t border-gray-200">
            <input
              className="flex-1 px-3 py-2 text-sm outline-none font-sans"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold font-sans">Gửi</button>
          </form>
        </div>
      ) : (
        <button
          className="bg-blue-600 text-white rounded-full shadow-lg p-4 hover:bg-blue-700 font-sans"
          onClick={() => setOpen(true)}
        >
          Hỗ trợ        </button>
      )}

    </div>
  );
}

export default ChatWidget;
