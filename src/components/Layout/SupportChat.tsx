import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import api from '@/services/axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
  messageCount: number;
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history when sessionId is available
  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await api.get(`/ChatGPTChat/history/${sessionId}`);
      const history = response.data;
      
      // Convert history to messages format
      const historyMessages: Message[] = history.map((item: any, index: number) => ({
        id: `history-${index}`,
        text: item.message || item.text,
        sender: item.sender === 'user' ? 'user' : 'support',
        timestamp: new Date(item.timestamp || Date.now())
      }));
      
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error for history loading, just start fresh
    }
  };

  // Initialize chat with welcome message
  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'support',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request data
      const requestData: any = {
        message: message
      };

      // Only include sessionId if we have one (not first message)
      if (sessionId) {
        requestData.sessionId = sessionId;
      }

      const response = await api.post('/ChatGPTChat/chat', requestData);
      const chatResponse: ChatResponse = response.data;

      // Update sessionId if this is the first message
      if (!sessionId && chatResponse.sessionId) {
        setSessionId(chatResponse.sessionId);
        // Save sessionId to localStorage for persistence
        localStorage.setItem('chatSessionId', chatResponse.sessionId);
      }

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatResponse.message,
        sender: 'support',
        timestamp: new Date(chatResponse.timestamp)
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize chat when component mounts
  useEffect(() => {
    // Check if there's a saved sessionId in localStorage
    const savedSessionId = localStorage.getItem('chatSessionId');
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Load chat history for existing session
      loadChatHistory(savedSessionId);
    } else {
      // Initialize with welcome message for new session
      initializeChat();
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 transition-all duration-200 ${
          isMinimized ? 'h-14' : 'h-96'
        }`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">AI Assistant</h3>
                <p className="text-xs text-blue-100">
                  {isLoading ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-64">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-xs px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-900">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                {error && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isLoading ? "AI is responding..." : "Type your message..."}
                    className="flex-1 text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="px-3"
                    disabled={isLoading || !message.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}