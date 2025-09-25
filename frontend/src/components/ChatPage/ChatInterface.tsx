import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion'
import { 
  Send, 
  User, 
  X,
  Sparkles,
  MessageCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Tool {
  id: number;
  name: string;
}

interface ChatInterfaceProps {
  theme?: 'light' | 'dark';
  contextTools?: Tool[];
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  onRemoveToolFromContext?: (toolId: number) => void;
}

// Typewriter Effect Component
const TypewriterText = ({ text, className, delay = 50, onComplete }: {
  text: string;
  className?: string;
  delay?: number;
  onComplete?: () => void;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, delay, onComplete]);

  return <span className={className}>{displayText}</span>;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  theme = 'light',
  contextTools = [],
  initialMessages = [],
  onSendMessage,
  onRemoveToolFromContext
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'dark';

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage?.(inputValue);
    const messageContent = inputValue;
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Start typing animation
    setIsTyping(true);

    // After a delay, add bot response with typewriter effect
    setTimeout(() => {
      setIsTyping(false);
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        content: 'I am in development',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setTypingMessageId(botMessageId);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  };

  // Theme classes
  const baseClasses = isDark
    ? 'bg-[#2d3748] border-[#4a5568] text-[#e2e8f0]'
    : 'bg-[#fafafa] border-[#e5e5e5] text-[#2a2a2a]';

  const cardClasses = isDark
    ? 'bg-[#374151] border-[#4b5563]'
    : 'bg-white border-[#e0e0e0]';

  const userMessageClasses = isDark
    ? 'bg-[#10b981] text-white'
    : 'bg-[#10b981] text-white';

  const assistantMessageClasses = isDark
    ? 'bg-[#374151] text-[#e2e8f0]'
    : 'bg-white text-[#2a2a2a] border border-[#e0e0e0]';

  const inputClasses = isDark
    ? 'bg-[#374151] border-[#4b5563] text-[#e2e8f0] placeholder-[#9ca3af]'
    : 'bg-white border-[#d0d0d0] text-[#2a2a2a] placeholder-[#6b7280]';

  // Animations
  const centerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const messageVariants : Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  // Enhanced Bot Icon Component
  const BotIcon = ({ className }: { className?: string }) => (
    <div className={`relative ${className || ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isDark ? 'bg-gradient-to-br from-[#10b981] to-[#059669]' : 'bg-gradient-to-br from-[#10b981] to-[#059669]'
      } shadow-lg`}>
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <motion.div
        className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#10b981] rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );

  // Loading Animation Component
  const LoadingAnimation = () => (
    <motion.div
      variants={loadingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center h-full"
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className={`w-16 h-16 rounded-full border-4 ${
            isDark 
              ? 'border-[#374151] border-t-[#10b981]' 
              : 'border-[#e5e7eb] border-t-[#10b981]'
          } mx-auto`} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-[#e2e8f0]' : 'text-[#2a2a2a]'}`}>
            Initializing AI Assistant
          </h3>
          <p className={`text-sm mt-2 ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
            Setting up your personalized experience...
          </p>
        </motion.div>
        <motion.div
          className="flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#10b981]' : 'bg-[#10b981]'}`}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <motion.div
        className={`flex-1 flex flex-col h-full ${baseClasses}`}
        variants={centerVariants}
        initial="hidden"
        animate="visible"
      >
        <LoadingAnimation />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex-1 flex flex-col h-full ${baseClasses}`}
      variants={centerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Chat header with enhanced design */}
      <div className={`p-6 border-b border-inherit ${cardClasses} backdrop-blur-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BotIcon />
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                AI Assistant
                <Zap className="w-4 h-4 text-[#10b981]" />
              </h1>
              <p className={`text-sm ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
                Professional AI-powered assistance
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs ${
            isDark ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#10b981]/10 text-[#059669]'
          }`}>
            Online
          </div>
        </div>

        {/* Context tools display */}
        {contextTools.length > 0 && (
          <motion.div
            className={`mt-4 pt-4 border-t ${isDark ? 'border-[#4a5568]' : 'border-[#e5e5e5]'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className={`text-xs mb-3 flex items-center gap-2 ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
              <MessageCircle className="w-3 h-3" />
              Active Context Tools:
            </p>
            <div className="flex flex-wrap gap-2">
              {contextTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs ${
                    isDark ? 'bg-[#374151] text-[#e2e8f0] border border-[#4b5563]' : 'bg-white text-[#2a2a2a] border border-[#e0e0e0]'
                  } shadow-sm`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="font-medium">{tool.name}</span>
                  <Button
                    onClick={() => onRemoveToolFromContext?.(tool.id)}
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="text-center space-y-6 max-w-md">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              >
                <BotIcon className="mx-auto" />
              </motion.div>
              <div>
                <motion.h2
                  className={`text-2xl font-bold ${isDark ? 'text-[#e2e8f0]' : 'text-[#2a2a2a]'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  How can I assist you today?
                </motion.h2>
              </div>
              <motion.p
                className={`${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'} text-base`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                Start a conversation to begin using your AI assistant
              </motion.p>
              <motion.div
                className="flex justify-center space-x-6 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <div className={`flex items-center gap-2 ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
                  <Sparkles className="w-4 h-4 text-[#10b981]" />
                  <span>AI-Powered</span>
                </div>
                <div className={`flex items-center gap-2 ${isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
                  <Zap className="w-4 h-4 text-[#10b981]" />
                  <span>Fast Response</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className={`flex mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[75%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {message.sender === 'user' ? (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-[#4a5568]' : 'bg-[#e5e7eb]'
                      }`}>
                        <User className={`h-4 w-4 ${isDark ? 'text-[#e2e8f0]' : 'text-[#4b5563]'}`} />
                      </div>
                    ) : (
                      <BotIcon />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? userMessageClasses
                      : assistantMessageClasses
                  }`}>
                    {message.sender === 'assistant' && typingMessageId === message.id ? (
                      <TypewriterText 
                        text={message.content}
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        delay={50}
                        onComplete={() => setTypingMessageId(null)}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                    <div className={`flex items-center gap-1 mt-2 text-xs opacity-60`}>
                      <Clock className="w-3 h-3" />
                      <span>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className="flex justify-start mb-6"
              >
                <div className="flex items-start space-x-3">
                  <BotIcon />
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${assistantMessageClasses}`}>
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#9ca3af]' : 'bg-[#6b7280]'}`}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced input area */}
      <div className={`p-6 border-t border-inherit ${cardClasses} backdrop-blur-md`}>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Type your message... (Shift + Enter for new line)"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className={`w-full resize-none pr-12 py-3 px-4 text-sm rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] ${inputClasses}`}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isTyping}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className={`absolute h-8 w-8 top-1/2 -translate-y-1/2 right-2 rounded-lg ${
                !inputValue.trim() || isTyping 
                  ? 'opacity-50 bg-[#9ca3af]' 
                  : 'bg-[#10b981] hover:bg-[#059669] text-white shadow-lg hover:shadow-xl'
              } transition-all duration-200`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Example usage
// export default function App() {
//   const contextTools = [
//     { id: 1, name: 'Project Management' },
//     { id: 2, name: 'Data Analysis' }
//   ];

//   // Example with previous messages
//   const previousMessages: Message[] = [
//     {
//       id: '1',
//       content: 'Hello! How can I help you today?',
//       sender: 'assistant',
//       timestamp: new Date(Date.now() - 300000) // 5 minutes ago
//     },
//     {
//       id: '2',
//       content: 'I need help with my project planning.',
//       sender: 'user',
//       timestamp: new Date(Date.now() - 240000) // 4 minutes ago
//     },
//     {
//       id: '3',
//       content: 'I am in development',
//       sender: 'assistant',
//       timestamp: new Date(Date.now() - 180000) // 3 minutes ago
//     }
//   ];

//   return (
//     <div className="h-screen w-full bg-[#fafafa] dark:bg-[#2d3748] flex">
//       <ChatInterface
//         theme="dark"
//         contextTools={contextTools}
//         initialMessages={previousMessages} // Pass previous messages or [] for empty
//         onSendMessage={(message) => {
//           console.log('Message sent:', message);
//         }}
//         onRemoveToolFromContext={(id) => console.log('Remove tool:', id)}
//       />
//     </div>
//   );
// }