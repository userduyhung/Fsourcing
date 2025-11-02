import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, ArrowLeft } from 'lucide-react';

interface Message {
  id: number;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

const ChatPage: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      sellerId: 'seller1',
      sellerName: 'Công ty Điện tử ABC',
      sellerAvatar: 'https://ui-avatars.com/api/?name=ABC&background=0D8ABC&color=fff',
      lastMessage: 'Chúng tôi có thể cung cấp sản phẩm này với giá tốt',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 phút trước
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      sellerId: 'seller2',
      sellerName: 'Nhà máy Sản xuất XYZ',
      sellerAvatar: 'https://ui-avatars.com/api/?name=XYZ&background=F59E0B&color=fff',
      lastMessage: 'Cảm ơn bạn đã quan tâm đến sản phẩm',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 phút trước
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      sellerId: 'seller3',
      sellerName: 'Công ty TNHH Thương mại DEF',
      sellerAvatar: 'https://ui-avatars.com/api/?name=DEF&background=10B981&color=fff',
      lastMessage: 'Vâng, chúng tôi có sẵn hàng',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 giờ trước
      unreadCount: 1,
      isOnline: true
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 'buyer',
      text: 'Xin chào, tôi quan tâm đến sản phẩm linh kiện điện tử của bạn',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isRead: true
    },
    {
      id: 2,
      senderId: 'seller1',
      text: 'Chào bạn! Cảm ơn bạn đã liên hệ. Chúng tôi có nhiều loại linh kiện điện tử chất lượng cao.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      isRead: true
    },
    {
      id: 3,
      senderId: 'buyer',
      text: 'Bạn có thể gửi cho tôi báo giá cho 1000 chiếc được không?',
      timestamp: new Date(Date.now() - 1000 * 60 * 7),
      isRead: true
    },
    {
      id: 4,
      senderId: 'seller1',
      text: 'Vâng, chúng tôi có thể cung cấp sản phẩm này với giá tốt',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const previousMessageCount = useRef(messages.length);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll to bottom when new message (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousMessageCount.current = messages.length;
      return;
    }
    // Chỉ scroll khi có tin nhắn mới được thêm vào
    if (messages.length > previousMessageCount.current && messagesEndRef.current) {
      previousMessageCount.current = messages.length;
      // Scroll trong container chat, không ảnh hưởng đến trang chính
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: messages.length + 1,
        senderId: 'buyer',
        text: newMessage,
        timestamp: new Date(),
        isRead: false
      };
      setMessages([...messages, message]);
      setNewMessage('');

      // Update last message in conversation
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
          : conv
      ));
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    setConversations(conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${isMobileView && !showConversationList ? 'hidden' : 'block'} w-full md:w-80 border-r border-gray-200 flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Tin nhắn</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.sellerAvatar}
                        alt={conversation.sellerName}
                        className="w-12 h-12 rounded-full"
                      />
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.sellerName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation && (
            <div className={`${isMobileView && showConversationList ? 'hidden' : 'flex'} flex-1 flex-col`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  {isMobileView && (
                    <button
                      onClick={() => setShowConversationList(true)}
                      className="mr-2 p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <img
                    src={selectedConversation.sellerAvatar}
                    alt={selectedConversation.sellerName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.sellerName}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === 'buyer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === 'buyer' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - No conversation selected */}
          {!selectedConversation && !isMobileView && (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
                <p className="text-gray-500">Chọn một nhà cung cấp để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
