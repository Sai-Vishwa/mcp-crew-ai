import React, { useState, useEffect, createContext, useContext, useCallback, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
// Note: Remove these imports in your actual implementation:
import { useNavigate } from 'react-router-dom';
import { ToolsPanel } from '../components/ChatPage/ToolsPanel';
import { ChatHistorySidebar } from '@/components/ChatPage/PreviousChat';
import { ChatInterface } from '@/components/ChatPage/ChatInterface';

// Mock components for demo
// const ToolsPanel = ({ tools, theme }) => <div className="p-4">Tools Panel</div>;
// const ChatHistorySidebar = ({ Chat, theme }) => <div className="p-4">Chat History</div>;

// Theme configuration
const getTheme = (isDark) => ({
  isDark,
  background: isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50',
  sidebarBackground: isDark ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]/80' : 'bg-white/95 border-gray-200/50',
  cardBackground: isDark ? 'bg-[#212121]/80 border-[#2a2a2a]/60' : 'bg-white/80 border-gray-200/50',
  textPrimary: isDark ? 'text-[#f5f5f5]' : 'text-gray-900',
  textSecondary: isDark ? 'text-[#a0a0a0]' : 'text-gray-600',
  buttonHover: isDark ? 'hover:bg-[#262626]/50' : 'hover:bg-gray-100/50',
  thinkingBg: isDark ? 'bg-[#1a1a1a]/60' : 'bg-blue-50/60',
  workflowBg: isDark ? 'bg-[#1e293b]/80' : 'bg-white/90',
  stepBg: isDark ? 'bg-[#1e293b]/50' : 'bg-gray-50/80',
  border: isDark ? 'border-[#2a2a2a]' : 'border-gray-200'
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
        currentMessages: []
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
            ...action.payload
          };
        }
      }
      console.log("inga paaru last msg ah add panten")
      return { ...state, currentMessages: messages };

    
    case 'ADD_THINKING_STEP':
      const msgs = [...state.currentMessages];
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender === 'assistant') {
          msgs[msgs.length - 1] = {
            ...lastMsg,
            thinkingSteps: [...(lastMsg.thinkingSteps || []), action.payload]
          };
        }
      }
      return { ...state, currentMessages: msgs };
    
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

// Workflow Display Component
const WorkflowDisplay = ({ workflow, theme, onProceed, onRegenerate }) => {
  const themeObj = getTheme(theme === 'dark');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${themeObj.workflowBg} border ${themeObj.border} rounded-xl p-6 space-y-4 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`${themeObj.isDark ? 'bg-green-500/20' : 'bg-green-100'} p-2 rounded-lg`}>
          <CheckCircle2 className={`w-5 h-5 ${themeObj.isDark ? 'text-green-400' : 'text-green-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`${themeObj.textPrimary} text-lg font-semibold mb-1`}>
            {workflow.workflow_name}
          </h3>
          <p className={`${themeObj.textSecondary} text-sm`}>
            {workflow.workflow_description}
          </p>
        </div>
        <div className={`${themeObj.isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} px-3 py-1 rounded-full text-xs font-medium`}>
          {(workflow.confidence_score * 100).toFixed(0)}% confidence
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        <h4 className={`${themeObj.textPrimary} text-sm font-semibold flex items-center gap-2`}>
          <span>Workflow Steps</span>
          <span className={`${themeObj.textSecondary} text-xs font-normal`}>
            ({workflow.workflow_steps.length} steps)
          </span>
        </h4>
        
        <div className="space-y-2">
          {workflow.workflow_steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${themeObj.stepBg} border ${themeObj.border} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`${themeObj.isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
                  {step.step_number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${themeObj.textPrimary} font-semibold text-sm`}>
                      {step.tool_name}
                    </span>
                  </div>
                  <p className={`${themeObj.textSecondary} text-xs mb-2`}>
                    {step.tool_description}
                  </p>
                  {step.params_required.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {step.params_required.map((param, idx) => (
                        <span
                          key={idx}
                          className={`${themeObj.isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-200 text-gray-700'} px-2 py-1 rounded text-xs font-mono`}
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className={`${themeObj.stepBg} border ${themeObj.border} rounded-lg p-4`}>
        <h4 className={`${themeObj.textPrimary} text-sm font-semibold mb-2`}>Reasoning</h4>
        <p className={`${themeObj.textSecondary} text-sm leading-relaxed`}>
          {workflow.reasoning}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onProceed}
          className={`flex-1 ${themeObj.isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Proceed with Workflow
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          className={`${themeObj.isDark ? 'border-[#2a2a2a] hover:bg-[#2a2a2a]' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>
    </motion.div>
  );
};

// Thinking Steps Display
const ThinkingSteps = ({ steps, theme }) => {
  const themeObj = getTheme(theme === 'dark');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${themeObj.thinkingBg} border ${themeObj.border} rounded-lg p-4 space-y-2`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className={`w-4 h-4 ${themeObj.isDark ? 'text-blue-400' : 'text-blue-600'} animate-spin`} />
        <span className={`${themeObj.textPrimary} text-sm font-semibold`}>Processing...</span>
      </div>
      
      <AnimatePresence>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${themeObj.isDark ? 'bg-blue-400' : 'bg-blue-600'} mt-1.5 flex-shrink-0`} />
            <span className={`${themeObj.textSecondary} text-sm`}>{step}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Message Component
const MessageBubble = ({ message, theme, onProceed, onRegenerate }) => {
  const themeObj = getTheme(theme === 'dark');
  
  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className={`${themeObj.isDark ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-2xl px-4 py-3 max-w-2xl`}>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-start mb-4">

      {!(message?.content && message?.content?.length > 0)  && 

      <div className="max-w-3xl w-full space-y-3">
        {message.thinkingSteps && message.thinkingSteps.length > 0 && !message.workflow && (
          <ThinkingSteps steps={message.thinkingSteps} theme={theme} />
        )}
        
        {message.workflow && (
          <WorkflowDisplay 
            workflow={message.workflow} 
            theme={theme}
            onProceed={() => onProceed(message.workflow)}
            onRegenerate={() => onRegenerate(message.workflow)}
          />
        )}
      </div>
      }

      <div>
        {
          message?.content && message?.content?.length > 0  && (
            <div className="max-w-3xl w-full space-y-3 flex justify-start mb-4">
              
            <div className={`${themeObj.stepBg} border ${themeObj.border} rounded-lg p-4`}>
              <h4 className={`${themeObj.textPrimary} text-sm font-semibold mb-2`}>{message.content}</h4>
              <p className={`${themeObj.textSecondary} text-sm leading-relaxed`}>
                {message.content}
              </p>
            </div>

            </div>
          )
        }
      </div>
    </div>
  );
};

// Provider component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const nav = useNavigate(); // Use in your implementation
  const session = Cookies.get('session')

  useEffect(() => {
    const loadData = async () => {
      // Mock data for demo - replace with your actual API call
      const mockTools = [
        { id: 1, name: 'UpdateExam', description: 'Updates exam entries', available: 1 },
        { id: 2, name: 'ReadPlacement', description: 'Reads placement data', available: 1 }
      ];
      
      const mockChats = [
        { chatid: 1, chatName: 'Previous Chat', lastchatdate: new Date().toISOString() }
      ];

      dispatch({ type: 'SET_TOOLS', payload: mockTools });
      dispatch({ type: 'SET_CHATS', payload: mockChats.map(chat => ({
        id: chat.chatid,
        name: chat.chatName,
        timestamp: new Date(chat.lastchatdate),
        lastMessage: "Last message"
      })) });

      //  Your actual implementation:
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
          const tools = data.data.tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            available: tool.available,
          }));

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
  }, [session]);;

  const parseWorkflowResponse = (respString) => {
    try {
      
      return JSON.parse(respString);
    } catch (e) {
      console.error("Error parsing workflow:", e);
      return null;
    }
  };

  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      thinkingSteps: [],
      workflow: null
    };
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Demo mode - simulate backend response
    const demoMode = false // Set to false to use real backend
    
    if (demoMode) {
      // Simulate thinking steps
      const thinkingSteps = [
        'Checking if tools are set',
        'Checking if agents are set',
        'Checking if this is a new chat request',
        'The user session is valid and a new chat memory is created',
        'Checking if memory is loaded',
        'Relevant workflows fetched successfully',
        'Checking if prompt template is set',
        'Reasoning agent predicted the workflow'
      ];
      
      for (const step of thinkingSteps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        dispatch({ type: 'ADD_THINKING_STEP', payload: step });
      }
      
      // Simulate final workflow
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockWorkflow = {
        is_new_workflow: true,
        workflow_id: null,
        workflow_name: 'Reschedule Exam and Check Placement Clash',
        workflow_description: 'Reschedules the final exams and checks for placement clashes on the new date.',
        workflow_steps: [
          {
            step_number: 1,
            tool_name: 'UpdateExam',
            tool_description: 'Updates an exam entry on the database by changing the exam date, start time and end time of the provided exam name.',
            params_required: ['exam_name', 'new_exam_date', 'old_exam_date', 'session']
          },
          {
            step_number: 2,
            tool_name: 'ReadPlacement',
            tool_description: 'Reads all placement entries.',
            params_required: ['session']
          }
        ],
        confidence_score: 0.9,
        reasoning: 'Generated a new workflow. The user wants to reschedule exams and check for placement clashes. The hierarchy is respected by first updating the exam and then checking for placement clashes. The UpdateExam tool is used to change the exam date. The ReadPlacement tool is used to check for placement clashes. A session ID is required for both operations.'
      };
      
      dispatch({ 
        type: 'UPDATE_LAST_MESSAGE', 
        payload: { workflow: mockWorkflow, thinkingSteps: [] }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Real backend implementation
    try {
      const res = await fetch(`http://localhost:4005/invoke-graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_session: session, user_input: content, is_new_chat: true }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        let parsed = {"is_final" : "true" , "resp" : ""}
        for (const part of parts) {
          if (part.startsWith("data:")) {
            try {
              const jsonString = part.replace(/^data:\s*/, "");
              parsed = JSON.parse(jsonString);
            } catch (err) {
              console.error("Error parsing SSE chunk:", err);
            }
          }
        

          console.log("HEHEHEHEHEH")
          console.log(JSON.stringify(parsed))
        
        // // Split by }{ to handle multiple JSON objects
        // const chunks = buffer.split('}{');
        // buffer = chunks.pop() || ""; // Keep incomplete chunk in buffer
        
        // for (let i = 0; i < chunks.length; i++) {
        //   let chunk = chunks[i];
        //   if (i > 0) chunk = '{' + chunk;
        //   if (i < chunks.length - 1) chunk = chunk + '}';
          
          try {
            // chunk = "{" + chunk + "}"

            // let jsonStr = chunk.replace(/'/g, '"');

            // let obj = JSON.parse(jsonStr);
            // // console.log(obj)

            // const parsed = obj;

            console.log(parsed.is_final)
            // console.log(JSON.stringify(parsed))
            if (parsed.is_final === 'false') {
              // Add thinking step
              dispatch({ type: 'ADD_THINKING_STEP', payload: parsed.resp });
            } else if (parsed.is_final === 'true') {
              // Parse and set final workflow
              const workflow = typeof parsed.resp === 'string' 
                ? parseWorkflowResponse(parsed.resp)
                : parsed.resp;
              console.log("inga paaru workflow va ---->>> ")
              console.table(workflow)
              if (workflow) {
                dispatch({ 
                  type: 'UPDATE_LAST_MESSAGE', 
                  payload: { workflow, thinkingSteps: [] }
                });
              }
            }
            else {
              console.log("itho paaru thala last message error uh")
              console.table(parsed)
              dispatch({ 
                  type: 'UPDATE_LAST_MESSAGE', 
                  payload: { content: parsed.resp }
                });
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.log("Error sending message:", error);
      dispatch({ 
        type: 'UPDATE_LAST_MESSAGE', 
        payload: { content: 'Sorry, I encountered an error. Please try again.' }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [session]);

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

// Enhanced Chat Interface Component
const EnhancedChatInterface = ({ theme, messages, isLoading, onSendMessage, onProceedWorkflow, onRegenerateWorkflow }) => {
  const themeObj = getTheme(theme === 'dark');
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  return (
    <div className={`flex-1 flex flex-col ${themeObj.background}`}>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            theme={theme}
            onProceed={onProceedWorkflow}
            onRegenerate={onRegenerateWorkflow}
          />
        ))}
      </div>
      
      <div className={`border-t ${themeObj.border} p-4`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className={`flex-1 ${themeObj.cardBackground} ${themeObj.textPrimary} border ${themeObj.border} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Chat Page Component
const ChatPage = () => {
  const { state, actions } = useAppContext();
  const theme = getTheme(state.isDarkMode);
  const [regenerateContext, setRegenerateContext] = useState('');

  const handleNewChat = () => {
    actions.setCurrentChat(null);
  };

  const handleChatSelect = (chatId) => {
    actions.setCurrentChat(chatId);
  };

  const handleProceedWorkflow = (workflow) => {
    console.log("Proceeding with workflow:", workflow);
    // Implement workflow execution logic
  };

  const handleRegenerateWorkflow = (workflow) => {
    const context = prompt("Please provide additional context for regeneration:");
    if (context) {
      setRegenerateContext(context);
      // Re-send with additional context
      actions.sendMessage(`${workflow.workflow_description}\n\nAdditional context: ${context}`);
    }
  };

  return (
    <motion.div
      className={`h-screen flex ${theme.background} transition-colors duration-500`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ThemeToggle />
      
      <div className='w-1/6'>
        <ChatHistorySidebar 
          Chat={state.chats}
          theme={state.isDarkMode ? "dark" : "light"}
          activeChatId={state.currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </div>
      
      <EnhancedChatInterface
        theme={state.isDarkMode ? "dark" : "light"}
        messages={state.currentMessages}
        isLoading={state.isLoading}
        onSendMessage={actions.sendMessage}
        onProceedWorkflow={handleProceedWorkflow}
        onRegenerateWorkflow={handleRegenerateWorkflow}
      />
actions
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