import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Minimize2, Loader2, Bot, Sparkles } from 'lucide-react';
import api from '@/services/axios';
import { useAuth } from '@/pages/auth/AuthContext';
import { SubscriptionUtils } from '@/lib/subscription';

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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreePlan = SubscriptionUtils.isFreeUser(user);
  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const freePlanLimit = 5;
  const hasReachedFreeLimit = isFreePlan && userMessageCount >= freePlanLimit;

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

    if (hasReachedFreeLimit) {
      setError('Bạn đã dùng hết 5 tin nhắn của gói FREE. Nâng cấp để tiếp tục chat không giới hạn.');
      return;
    }

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
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 hover:shadow-3xl"
            size="sm"
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${hasReachedFreeLimit ? 'bottom-24' : 'bottom-6'} right-6 w-[400px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 transition-all duration-300 ease-in-out ${
          isMinimized ? 'h-16' : 'h-[500px]'
        } animate-in slide-in-from-bottom-4 fade-in-0`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 ring-2 ring-white/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  AI Assistant
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-sm text-blue-100">
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      Typing...
                    </span>
                  ) : isFreePlan ? (
                    `FREE: ${Math.min(userMessageCount, freePlanLimit)} / ${freePlanLimit} tin nhắn`
                  ) : (
                    'Unlimited messages'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-5 h-[340px]">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2`}
                    >
                      <div className={`max-w-[280px] px-4 py-3 rounded-2xl text-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-2 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2">
                      <div className="max-w-[280px] px-4 py-3 rounded-2xl text-sm bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 rounded-bl-md border border-gray-200 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                          <span className="text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-in fade-in-0 slide-in-from-top-2">
                    {error}
                  </div>
                )}
                {hasReachedFreeLimit && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl text-sm text-orange-700 animate-in fade-in-0 slide-in-from-top-2">
                    Bạn đã dùng hết 5 tin nhắn miễn phí. Nâng cấp để chat không giới hạn.
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => window.dispatchEvent(new Event('open-upgrade'))}
                      >
                        Nâng cấp ngay
                      </Button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isLoading ? "AI is responding..." : "Type your message..."}
                    className="flex-1 text-sm rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                    disabled={isLoading || hasReachedFreeLimit}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    disabled={isLoading || !message.trim() || hasReachedFreeLimit}
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