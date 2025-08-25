import React, { useState, useEffect, useRef, createContext, useContext, useCallback, useReducer } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Moon,
  Sun,
  Search,
  Send,
  MessageSquare,
  Plus,
  Clock,
  Wrench,
  Lock,
  CheckCircle,
  XCircle,
  User,
  Bot,
  Filter,
  X
} from 'lucide-react';

import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

// TypeScript interfaces
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  timestamp: Date;
  lastMessage?: string;
}

interface Tool {
  id: number;
  name: string;
  description: string;
  available: boolean;
  requested: boolean;
  addedAsContext: boolean;
}

interface Theme {
  isDark: boolean;
  background: string;
  sidebarBackground: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBackground: string;
  buttonBackground: string;
  buttonHover: string;
  borderColor: string;
  hoverBackground: string;
}

type ToolFilter = 'all' | 'available' | 'unavailable';

// State interfaces
interface AppState {
  theme: Theme;
  tools: Tool[];
  contextTools: Tool[];
  messages: Message[];
  chats: Chat[];
  currentChatId: string | null;
  isTyping: boolean;
  toolFilter: ToolFilter;
  toolSearchTerm: string;
  chatSearchTerm: string;
}

// Action types
type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_TOOLS'; payload: Tool[] }
  | { type: 'ADD_TOOL_TO_CONTEXT'; payload: number }
  | { type: 'REMOVE_TOOL_FROM_CONTEXT'; payload: number }
  | { type: 'REQUEST_TOOL_ACCESS'; payload: number }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CONTINUE_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_TOOL_FILTER'; payload: ToolFilter }
  | { type: 'SET_TOOL_SEARCH'; payload: string }
  | { type: 'SET_CHAT_SEARCH'; payload: string }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null };

// Theme hook
const useTheme = (isDark: boolean): Theme => {
  return {
    isDark,
    background: isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50',
    sidebarBackground: isDark
      ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]/80'
      : 'bg-white/95 border-gray-200/50',
    cardBackground: isDark
      ? 'bg-[#212121]/80 border-[#2a2a2a]/60'
      : 'bg-white/80 border-gray-200/50',
    textPrimary: isDark ? 'text-[#f5f5f5]' : 'text-gray-900',
    textSecondary: isDark ? 'text-[#a0a0a0]' : 'text-gray-600',
    textMuted: isDark ? 'text-[#737373]' : 'text-gray-500',
    inputBackground: isDark
      ? 'bg-[#212121]/80 border-[#2a2a2a]/80 text-[#f5f5f5] placeholder:text-[#737373] focus:border-[#404040]'
      : 'bg-white/70 border-gray-300/50 focus:border-gray-400',
    buttonBackground: isDark
      ? 'bg-[#f5f5f5] hover:bg-white text-[#0f0f0f]'
      : 'bg-gray-900 hover:bg-gray-800 text-white',
    buttonHover: isDark ? 'hover:bg-[#262626]/50' : 'hover:bg-gray-100/50',
    borderColor: isDark ? 'border-[#2a2a2a]/60' : 'border-gray-200/50',
    hoverBackground: isDark ? 'hover:bg-[#1f1f1f]/60' : 'hover:bg-gray-50/80'
  };
};

// Initial state
const createInitialState = (): AppState => ({
  theme: {} as Theme, // Will be set by reducer
  tools: [],
  contextTools: [],
  messages: [],
  chats: [],
  currentChatId: null,
  isTyping: false,
  toolFilter: 'all',
  toolSearchTerm: '',
  chatSearchTerm: ''
});

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newIsDark = !state.theme.isDark;
      return {
        ...state,
        theme: { ...useTheme(newIsDark), isDark: newIsDark }
      };

    case 'SET_TOOLS':
      return {
        ...state,
        tools: action.payload
      };

    case 'ADD_TOOL_TO_CONTEXT':
      const toolToAdd = state.tools.find(t => t.id === action.payload);
      if (!toolToAdd || state.contextTools.find(ct => ct.id === action.payload)) {
        return state;
      }
      
      const updatedToolForContext = { ...toolToAdd, addedAsContext: true };
      return {
        ...state,
        tools: state.tools.map(t => 
          t.id === action.payload ? updatedToolForContext : t
        ),
        contextTools: [...state.contextTools, updatedToolForContext]
      };

    case 'REMOVE_TOOL_FROM_CONTEXT':
      return {
        ...state,
        tools: state.tools.map(t => 
          t.id === action.payload ? { ...t, addedAsContext: false } : t
        ),
        contextTools: state.contextTools.filter(t => t.id !== action.payload)
      };

    case 'REQUEST_TOOL_ACCESS':
      return {
        ...state,
        tools: state.tools.map(t => 
          t.id === action.payload ? { ...t, requested: true } : t
        )
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'CONTINUE_MESSAGE':
        const messageToContinue = state.messages.find(m => m.id === action.payload.id);
        if(messageToContinue) {
            messageToContinue.content += `\n${action.payload.content}`;
            return {
                ...state,
                messages: [...state.messages.filter(m => m.id !== action.payload.id), messageToContinue]
            }
        }
        return {
        ...state,
        messages: [...state.messages, action.payload]
        }
    
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };

    case 'SET_TOOL_FILTER':
      return {
        ...state,
        toolFilter: action.payload
      };

    case 'SET_TOOL_SEARCH':
      return {
        ...state,
        toolSearchTerm: action.payload
      };

    case 'SET_CHAT_SEARCH':
      return {
        ...state,
        chatSearchTerm: action.payload
      };

    case 'SET_CHATS':
      return {
        ...state,
        chats: action.payload
      };

    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChatId: action.payload
      };

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    toggleTheme: () => void;
    addToolToContext: (toolId: number) => void;
    removeToolFromContext: (toolId: number) => void;
    requestToolAccess: (toolId: number) => void;
    sendMessage: (content: string) => Promise<void>;
    setToolFilter: (filter: ToolFilter) => void;
    setToolSearch: (term: string) => void;
    setChatSearch: (term: string) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Provider component
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, createInitialState());

  const nav = useNavigate();
  const session = Cookies.get('session');


  const controller = new AbortController();
  const signal = controller.signal;


  // Initialize theme
  useEffect(() => {
    useTheme(false); // Start with light theme
    dispatch({ type: 'TOGGLE_THEME' }); // This will set initial theme
  }, []);

  // Action creators
  const actions = {
    toggleTheme: useCallback(() => {
      dispatch({ type: 'TOGGLE_THEME' });
    }, []),

    addToolToContext: useCallback((toolId: number) => {
      dispatch({ type: 'ADD_TOOL_TO_CONTEXT', payload: toolId });
    }, []),

    removeToolFromContext: useCallback((toolId: number) => {
      dispatch({ type: 'REMOVE_TOOL_FROM_CONTEXT', payload: toolId });
    }, []),

    requestToolAccess: useCallback((toolId: number) => {
      dispatch({ type: 'REQUEST_TOOL_ACCESS', payload: toolId });
    }, []),

    sendMessage: useCallback(async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date()
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_TYPING', payload: true });

        const id = (Date.now() + 1).toString()

        const assistantMessage2: Message = {
            id: id,
            content: "",
            sender: 'assistant',
            timestamp: new Date()
        }
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage2 });


        try {
            const res = await fetch(`http://localhost:4006/user-input`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({ session: session, userMessage: content }),
            });

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let Content = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                Content = decoder.decode(value, { stream: true });
                console.log("Received chunk:", Content);

                const assistantMessage: Message = {
                    id: id,
                    content: Content,
                    sender: 'assistant',
                    timestamp: new Date()
                };

      // Instead of appending new message each chunk, replace the last assistant one
      dispatch({ type: 'CONTINUE_MESSAGE', payload: assistantMessage });
    }

    dispatch({ type: 'SET_TYPING', payload: false });
  } catch (error) {
    console.log("Error fetching tools:", error);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Hey vro... I know u r trying ur best , but long way to go vro ',
      sender: 'assistant',
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    dispatch({ type: 'SET_TYPING', payload: false });
  }
}, []),


    sendMessage2: useCallback(async (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_TYPING', payload: true });



    try {
            const res = await fetch(`http://localhost:4006/user-input`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: session , userMessage: content }),
            });
            const data = await res.json();
            let Content = "";

            if (data.status === "error") {
                console.log(JSON.stringify(data));
                Content = 'Hey vro... I know u r trying ur best , but long way to go vro ';
                
            }
            else {
                Content = data.response;
            }
            const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: Content,
                    sender: 'assistant',
                    timestamp: new Date()
                };
            dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
            dispatch({ type: 'SET_TYPING', payload: false });
        } 
        catch (error) {
            console.log("Error fetching tools:", error);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Hey vro... I know u r trying ur best , but long way to go vro ',
                sender: 'assistant',
                timestamp: new Date()
            };
            dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
            dispatch({ type: 'SET_TYPING', payload: false });
        }
   
    }, []),

    setToolFilter: useCallback((filter: ToolFilter) => {
      dispatch({ type: 'SET_TOOL_FILTER', payload: filter });
    }, []),

    setToolSearch: useCallback((term: string) => {
      dispatch({ type: 'SET_TOOL_SEARCH', payload: term });
    }, []),

    setChatSearch: useCallback((term: string) => {
      dispatch({ type: 'SET_CHAT_SEARCH', payload: term });
    }, [])
  };

  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
        try {
            const res = await fetch(`http://localhost:4006/chat-page`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session: session }),
            });
            const data = await res.json();

            if (data.status === "error") {
                console.log(JSON.stringify(data));
                nav("/")
            }
            else {
                const fetchedTools = data.data.tools;
                let tools : Tool[] = [];
                fetchedTools.forEach((tool: any) => {
                    tools.push({
                        id: tool.id,
                        name: tool.name,
                        description: tool.description,
                        available: tool.available === 1,
                        requested: false,
                        addedAsContext: false
                    });
                })
                const fetchedChats = data.data.chatHistory;
                let chats: Chat[] = [];
                fetchedChats.forEach((chat: any) => {
                    chats.push({
                        id: chat.id.toString(),
                        name: chat.chatName,
                        timestamp: new Date(chat.lastchatdate),
                        lastMessage: chat.lastchatdate ? "Last message at " + chat.lastchatdate : ""
                    });
                });

                dispatch({ type: 'SET_TOOLS', payload: tools });
                dispatch({ type: 'SET_CHATS', payload: chats });
            }
        } 
        catch (error) {
            console.log("Error fetching tools:", error);
            nav("/");
        }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Animation variants
const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const sidebarVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const centerVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const messageVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const itemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    x: 2,
    transition: { duration: 0.2 }
  }
};

// Typewriter component
const TypewriterText: React.FC<{ 
  text: string; 
  delay?: number; 
  className?: string 
}> = ({ text, delay = 0, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, delay + 50);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-current ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </span>
  );
};

// Search component
const SearchBar: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
}> = ({ placeholder, value, onChange, theme }) => (
  <div className="relative">
    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme.textMuted}`} />
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`pl-10 h-9 text-sm ${theme.inputBackground}`}
    />
  </div>
);

// Previous chats sidebar
const PreviousChats: React.FC = () => {
  const { state, actions } = useAppContext();
  
  const filteredChats = state.chats.filter(chat =>
    chat.name.toLowerCase().includes(state.chatSearchTerm.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(state.chatSearchTerm.toLowerCase()))
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className={`w-80 h-full ${state.theme.sidebarBackground} backdrop-blur-md border-r flex flex-col`}
      variants={sidebarVariants}
    >
      <div className="p-4 border-b border-gray-200/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${state.theme.textPrimary}`}>Conversations</h2>
          <Button variant="ghost" size="icon" className={state.theme.buttonHover}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SearchBar
          placeholder="Search conversations..."
          value={state.chatSearchTerm}
          onChange={actions.setChatSearch}
          theme={state.theme}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {filteredChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              whileHover="hover"
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 group ${state.theme.hoverBackground}`}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare className={`h-4 w-4 mt-1 ${state.theme.textMuted}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${state.theme.textPrimary}`}>
                    {chat.name}
                  </p>
                  <p className={`text-xs truncate ${state.theme.textMuted} mt-1`}>
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className={`h-3 w-3 mr-1 ${state.theme.textMuted}`} />
                    <span className={`text-xs ${state.theme.textMuted}`}>
                      {formatTime(chat.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Tools sidebar
const ToolsSidebar: React.FC = () => {
  const { state, actions } = useAppContext();
  
  const filteredTools = state.tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(state.toolSearchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(state.toolSearchTerm.toLowerCase());

    if (state.toolFilter === 'available') return matchesSearch && tool.available;
    if (state.toolFilter === 'unavailable') return matchesSearch && !tool.available;
    return matchesSearch;
  });

  return (
    <motion.div
      className={`w-80 h-full ${state.theme.sidebarBackground} backdrop-blur-md border-l flex flex-col`}
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.2 }}
    >
      <div className="p-4 border-b border-gray-200/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${state.theme.textPrimary}`}>Tools</h2>
        </div>

        <div className="space-y-3">
          <SearchBar
            placeholder="Search tools..."
            value={state.toolSearchTerm}
            onChange={actions.setToolSearch}
            theme={state.theme}
          />

          <div className="flex space-x-1">
            {(['all', 'available', 'unavailable'] as ToolFilter[]).map((filter) => (
              <Button
                key={filter}
                onClick={() => actions.setToolFilter(filter)}
                variant={state.toolFilter === filter ? "default" : "ghost"}
                size="sm"
                className={`text-xs capitalize h-7 px-2 ${
                  state.toolFilter === filter
                    ? state.theme.buttonBackground
                    : state.theme.buttonHover
                }`}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg mb-3 transition-all duration-200 ${state.theme.cardBackground} backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-sm font-semibold ${state.theme.textPrimary}`}>
                  {tool.name}
                </h3>
                {tool.available ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className={`text-xs ${state.theme.textSecondary} mb-3 leading-relaxed`}>
                {tool.description}
              </p>

              {tool.available ? (
                <Button
                  onClick={() => 
                    tool.addedAsContext 
                      ? actions.removeToolFromContext(tool.id) 
                      : actions.addToolToContext(tool.id)
                  }
                  size="sm"
                  variant={tool.addedAsContext ? "default" : "outline"}
                  className={`w-full text-xs h-8 transition-all duration-200 ${
                    tool.addedAsContext
                      ? state.theme.buttonBackground
                      : state.theme.buttonHover
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {tool.addedAsContext ? (
                      <>
                        <X className="h-3 w-3" />
                        <span>Remove from Context</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        <span>Add as Context</span>
                      </>
                    )}
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={() => actions.requestToolAccess(tool.id)}
                  disabled={tool.requested}
                  size="sm"
                  variant="outline"
                  className={`w-full text-xs h-8 transition-all duration-200 ${
                    tool.requested
                      ? 'opacity-60 cursor-not-allowed'
                      : state.theme.buttonHover
                  }`}
                >
                  {tool.requested ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Request Sent</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Request Access</span>
                    </div>
                  )}
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Chat interface
const ChatInterface: React.FC = () => {
  const { state, actions } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    await actions.sendMessage(inputValue);
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  return (
    <motion.div
      className="flex-1 flex flex-col h-full"
      variants={centerVariants}
    >
      {/* Chat header with context tools */}
      <div className={`p-4 border-b ${state.theme.borderColor} ${state.theme.sidebarBackground} backdrop-blur-md`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-semibold ${state.theme.textPrimary}`}>
              AI Assistant
            </h1>
            <p className={`text-sm ${state.theme.textSecondary}`}>
              Professional AI-powered assistance
            </p>
          </div>
        </div>

        {/* Context tools display */}
        {state.contextTools.length > 0 && (
          <motion.div
            className="mt-3 pt-3 border-t border-gray-200/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className={`text-xs ${state.theme.textMuted} mb-2`}>Active Context:</p>
            <div className="flex flex-wrap gap-2">
              {state.contextTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs ${
                    state.theme.isDark ? 'bg-[#2a2a2a]/60 text-[#f5f5f5]' : 'bg-gray-100/80 text-gray-700'
                  }`}
                >
                  <Wrench className="h-3 w-3" />
                  <span>{tool.name}</span>
                  <Button
                    onClick={() => actions.removeToolFromContext(tool.id)}
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-red-500/20"
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.messages.length === 0 ? (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="text-center space-y-4 max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Bot className={`h-12 w-12 mx-auto ${state.theme.textMuted}`} />
              </motion.div>
              <div>
                <TypewriterText
                  text="How can I assist you today?"
                  className={`text-xl font-medium ${state.theme.textPrimary}`}
                  delay={10}
                />
              </div>
              <motion.p
                className={`${state.theme.textSecondary} text-sm`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 0.6 }}
              >
                Start a conversation to begin using the AI assistant
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {state.messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? (state.theme.isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200')
                      : (state.theme.isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200')
                  }`}>
                    {message.sender === 'user' ? (
                      <User className={`h-4 w-4 ${state.theme.isDark ? 'text-[#f5f5f5]' : 'text-gray-700'}`} />
                    ) : (
                      <Bot className={`h-4 w-4 ${state.theme.isDark ? 'text-[#f5f5f5]' : 'text-gray-700'}`} />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? `${state.theme.cardBackground} ${state.theme.textPrimary}`
                      : `${state.theme.cardBackground} ${state.theme.textPrimary}`
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <span className={`text-xs mt-2 block opacity-70 ${state.theme.textMuted}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {state.isTyping && (
              <motion.div
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className="flex justify-start mb-4"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    state.theme.isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'
                  }`}>
                    <Bot className={`h-4 w-4 ${state.theme.isDark ? 'text-[#f5f5f5]' : 'text-gray-700'}`} />
                  </div>
                  <div className={`p-3 rounded-lg ${state.theme.cardBackground}`}>
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full ${state.theme.isDark ? 'bg-[#737373]' : 'bg-gray-500'}`}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 1.4,
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

      {/* Input area */}
      <div className={`p-4 border-t ${state.theme.borderColor} ${state.theme.sidebarBackground} backdrop-blur-md`}>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Type your message... (Shift + Enter for new line)"
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className={`w-full resize-none pr-12 py-2 px-3 text-sm rounded-md border transition-colors duration-200 ${state.theme.inputBackground}`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={state.isTyping}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || state.isTyping}
              size="icon"
              className={`absolute h-8 w-8 bottom-3 right-1 ${
                !inputValue.trim() || state.isTyping ? 'opacity-50' : state.theme.buttonBackground
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Theme toggle
const ThemeToggle: React.FC = () => {
  const { state, actions } = useAppContext();
  
  return (
    <motion.div
      className="absolute top-4 right-4 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={actions.toggleTheme}
        className={`transition-all duration-300 ${state.theme.buttonHover}`}
      >
        <motion.div
          key={state.theme.isDark ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {state.theme.isDark ? (
            <Sun className="h-4 w-4 text-white" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

// Main Chat Page Component
const ChatPage: React.FC = () => {
  const { state } = useAppContext();

  return (
    <motion.div
      className={`h-screen flex ${state.theme.background} transition-colors duration-500`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <ThemeToggle />
      <PreviousChats />
      <ChatInterface />
      <ToolsSidebar />
    </motion.div>
  );
};

// Main App Component with Provider
const App: React.FC = () => {
    return (
        <AppProvider>
        <ChatPage />
        </AppProvider>
    );
    };

    export default App;