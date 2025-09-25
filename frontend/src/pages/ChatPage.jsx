import React, { useState, useEffect, createContext, useContext, useCallback, useReducer } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ToolsPanel } from '../components/ChatPage/ToolsPanel';
import { ChatHistorySidebar } from '@/components/ChatPage/PreviousChat';
import { ChatInterface } from '@/components/ChatPage/ChatInterface';

// Simple interfaces
const Message = {
  id: '',
  content: '',
  sender: 'user', // or 'assistant'
  timestamp: new Date()
};

const Chat = {
  id: 0,
  name: '',
  timestamp: new Date(),
  lastMessage: ''
};

const Tool = {
  id: 0,
  name: '',
  description: '',
  available: 0
};

// Theme configuration
const getTheme = (isDark) => ({
  isDark,
  background: isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50',
  sidebarBackground: isDark ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]/80' : 'bg-white/95 border-gray-200/50',
  cardBackground: isDark ? 'bg-[#212121]/80 border-[#2a2a2a]/60' : 'bg-white/80 border-gray-200/50',
  textPrimary: isDark ? 'text-[#f5f5f5]' : 'text-gray-900',
  textSecondary: isDark ? 'text-[#a0a0a0]' : 'text-gray-600',
  buttonHover: isDark ? 'hover:bg-[#262626]/50' : 'hover:bg-gray-100/50'
});

// Simplified state management
const initialState = {
  isDarkMode: false,
  tools: [],
  contextTools: [],
  chats: [],
  currentChatId: null,
  currentMessages: [],
  isLoading: false
};

// Simple reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    
    case 'SET_TOOLS':
      return { ...state, tools: action.payload };
    
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    
    case 'SET_CURRENT_CHAT':
      return { 
        ...state, 
        currentChatId: action.payload,
        currentMessages: [] // Clear messages when switching chats
      };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        currentMessages: [...state.currentMessages, action.payload] 
      };
    
    case 'UPDATE_LAST_MESSAGE':
      const messages = [...state.currentMessages];
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            content: action.payload
          };
        }
      }
      return { ...state, currentMessages: messages };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'ADD_TOOL_TO_CONTEXT':
      const toolToAdd = state.tools.find(t => t.id === action.payload);
      if (!toolToAdd || state.contextTools.find(ct => ct.id === action.payload)) {
        return state;
      }
      return {
        ...state,
        contextTools: [...state.contextTools, toolToAdd]
      };
    
    case 'REMOVE_TOOL_FROM_CONTEXT':
      return {
        ...state,
        contextTools: state.contextTools.filter(t => t.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Provider component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const nav = useNavigate();
  const session = Cookies.get('session');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`http://localhost:4005/chat-page`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: session }),
        });
        const data = await res.json();

        if (data.status === "error") {
          console.log(JSON.stringify(data));
          nav("/");
        } else {
          // Process tools
          const tools = data.data.tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            available: tool.available,
          }));

          // Process chats
          const chats = data.data.chatHistory.map(chat => ({
            id: chat?.chatid,
            name: chat.chatName,
            timestamp: new Date(chat.lastchatdate),
            lastMessage: chat.lastchatdate ? "Last message at " + chat.lastchatdate : ""
          }));

          dispatch({ type: 'SET_TOOLS', payload: tools });
          dispatch({ type: 'SET_CHATS', payload: chats });
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        nav("/");
      }
    };

    loadData();
  }, [session, nav]);

  // Send message function
  const sendMessage = useCallback(async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // Add empty assistant message
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'assistant',
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await fetch(`http://localhost:4005/invoke-graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: session, userMessage: content }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        
        // Update the last assistant message with accumulated content
        dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: accumulatedContent });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.log("Error sending message:", error);
      dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: 'Sorry, I encountered an error. Please try again.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [session]);

  // Actions
  const actions = {
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
    sendMessage,
    setCurrentChat: (chatId) => dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId }),
    addToolToContext: (toolId) => dispatch({ type: 'ADD_TOOL_TO_CONTEXT', payload: toolId }),
    removeToolFromContext: (toolId) => dispatch({ type: 'REMOVE_TOOL_FROM_CONTEXT', payload: toolId })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Theme toggle component
const ThemeToggle = () => {
  const { state, actions } = useAppContext();
  const theme = getTheme(state.isDarkMode);
  
  return (
    <motion.div
      className="absolute top-4 right-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={actions.toggleTheme}
        className={`transition-all duration-300 ${theme.buttonHover}`}
      >
        <motion.div
          key={state.isDarkMode ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {state.isDarkMode ? (
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
const ChatPage = () => {
  const { state, actions } = useAppContext();
  const theme = getTheme(state.isDarkMode);

  const handleNewChat = () => {
    actions.setCurrentChat(null);
  };

  const handleChatSelect = (chatId) => {
    actions.setCurrentChat(chatId);
    // Here you would typically load messages for the selected chat
  };

  return (
    <motion.div
      className={`h-screen flex ${theme.background} transition-colors duration-500`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ThemeToggle />
      
      {/* Chat History Sidebar */}
      <div className='w-1/6'>
        <ChatHistorySidebar 
          Chat={state.chats}
          theme={state.isDarkMode ? "dark" : "light"}
          activeChatId={state.currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </div>
      
      {/* Main Chat Interface */}
      <ChatInterface 
        theme={state.isDarkMode ? "dark" : "light"}
        contextTools={state.contextTools}
        messages={state.currentMessages}
        isLoading={state.isLoading}
        onSendMessage={actions.sendMessage}
        onRemoveToolFromContext={actions.removeToolFromContext}
      />

      {/* Tools Sidebar */}
      <div className='w-1/6'>
        <ToolsPanel
          tools={state.tools}
          theme={state.isDarkMode ? "dark" : "light"}
          onAddToContext={actions.addToolToContext}
          onRemoveFromContext={actions.removeToolFromContext}
          onRequestAccess={() => {}}
        />
      </div>
    </motion.div>
  );
};

// Main App Component with Provider
const App = () => {
  return (
    <AppProvider>
      <ChatPage />
    </AppProvider>
  );
};

export default App;