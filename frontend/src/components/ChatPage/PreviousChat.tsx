import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Plus, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatHistory {
  chatid: number;
  lastchatdate: string;
  chatName: string;
}

interface Chat {
  id: number;
  name: string;
  timestamp: Date;
  lastMessage?: string;
}

interface ChatHistorySidebarProps {
  Chat: Chat[];
  theme?: 'light' | 'dark';
  onChatSelect?: (chatId: number) => void;
  onNewChat?: () => void;
  activeChatId?: number;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  Chat,
  theme = 'light',
  onChatSelect,
  onNewChat,
  activeChatId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  let chatHistory : ChatHistory[]  = [];

  Chat.map((chat)=> {
    let value : ChatHistory;
    value = {chatid : chat.id , chatName : chat.name , lastchatdate : chat.timestamp.toLocaleString()}
    chatHistory.push(value)
  })


  const isDark = theme === 'dark';

  // Sort chats by date (newest first) and filter by search term
  const filteredAndSortedChats = useMemo(() => {
    let filtered = chatHistory.filter(chat =>
      chat.chatName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Sort by lastchatdate descending (newest first)
    return filtered.sort((a, b) => 
      new Date(b.lastchatdate).getTime() - new Date(a.lastchatdate).getTime()
    );
  }, [chatHistory, searchTerm]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants : Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    exit: { 
      opacity: 0, 
      x: -10, 
      transition: { duration: 0.2 } 
    }
  };

  const baseClasses = isDark
    ? 'bg-[#2d3748] border-[#4a5568] text-[#e2e8f0]'
    : 'bg-[#fafafa] border-[#e5e5e5] text-[#2a2a2a]';

  const cardClasses = isDark
    ? 'bg-[#374151] border-[#4b5563] hover:bg-[#3f4654]'
    : 'bg-white border-[#e0e0e0] hover:bg-[#f8f8f8]';

  const buttonClasses = isDark
    ? 'bg-[#4b5563] hover:bg-[#5b6575] hover:text-white text-[#e2e8f0]'
    : 'bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#2a2a2a]';

  const activeChatClasses = isDark
    ? 'bg-[#10b981]/20 border-[#10b981]/30'
    : 'bg-[#10b981]/10 border-[#10b981]/20';

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={`w-80 h-full ${baseClasses} border-r flex flex-col fixed left-0 top-0 z-40`}
    >
      {/* Header */}
      <div className="p-4 border-b border-inherit">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#10b981]" />
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${buttonClasses} w-8 h-8`}
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4 text-[#10b981]" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${isDark ? 'bg-[#4a5568] border-[#5b6575]' : 'bg-white border-[#d0d0d0]'}`}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedChats.map((chat) => (
            <motion.div
              key={chat.chatid}
              variants={itemVariants}
              layout
              exit="exit"
              className={`${cardClasses} ${activeChatId === chat.chatid ? activeChatClasses : ''} border rounded-lg p-2 mb-2 cursor-pointer transition-all duration-200 group relative`}
              onClick={() => onChatSelect?.(chat.chatid)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeChatId === chat.chatid 
                      ? 'bg-[#10b981]' 
                      : isDark ? 'bg-[#4a5568]' : 'bg-[#e5e7eb]'
                  }`}>
                    <MessageSquare className={`w-3 h-3 ${
                      activeChatId === chat.chatid 
                        ? 'text-white' 
                        : isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      activeChatId === chat.chatid ? 'text-[#10b981]' : ''
                    }`}>
                      {chat.chatName}
                    </p>
                    
                    <div className="flex items-center mt-1">
                      <Clock className={`h-3 w-3 mr-1 opacity-50`} />
                      <span className={`text-xs opacity-50`}>
                        {formatTime(chat.lastchatdate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {activeChatId === chat.chatid && (
                <motion.div
                  layoutId="activeChat"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981] rounded-r"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAndSortedChats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 opacity-60"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No conversations found</p>
            {searchTerm && (
              <p className="text-xs mt-1">Try adjusting your search</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-inherit">
        <div className="text-xs opacity-60 text-center">
          {filteredAndSortedChats.length} conversation{filteredAndSortedChats.length !== 1 ? 's' : ''}
        </div>
      </div>
    </motion.div>
  );
};

// Example usage with sample data
// export default function App() {
//   const [activeChatId, setActiveChatId] = useState<number>(21);
  
//   const sampleChatHistory = [
//     {'chatid': 1, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-22T11:12:40.000Z', 'chatName': 'New Chat'},
//     {'chatid': 2, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-22T11:35:10.000Z', 'chatName': 'New Chat'},
//     {'chatid': 3, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-22T11:35:35.000Z', 'chatName': 'New Chat'},
//     {'chatid': 4, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-22T11:35:52.000Z', 'chatName': 'New Chat'},
//     {'chatid': 5, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T07:53:37.000Z', 'chatName': 'New Chat'},
//     {'chatid': 6, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T07:59:33.000Z', 'chatName': 'New Chat'},
//     {'chatid': 7, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T08:01:39.000Z', 'chatName': 'New Chat'},
//     {'chatid': 8, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T08:04:44.000Z', 'chatName': 'New Chat'},
//     {'chatid': 9, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T09:36:34.000Z', 'chatName': 'New Chat'},
//     {'chatid': 10, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T09:38:31.000Z', 'chatName': 'New Chat'},
//     {'chatid': 11, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T09:38:55.000Z', 'chatName': 'New Chat'},
//     {'chatid': 12, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T09:41:13.000Z', 'chatName': 'New Chat'},
//     {'chatid': 13, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T09:43:06.000Z', 'chatName': 'New Chat'},
//     {'chatid': 14, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:05:52.000Z', 'chatName': 'New Chat'},
//     {'chatid': 15, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:06:58.000Z', 'chatName': 'New Chat'},
//     {'chatid': 16, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:09:49.000Z', 'chatName': 'New Chat'},
//     {'chatid': 17, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:11:08.000Z', 'chatName': 'New Chat'},
//     {'chatid': 18, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:11:45.000Z', 'chatName': 'New Chat'},
//     {'chatid': 19, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:12:59.000Z', 'chatName': 'New Chat'},
//     {'chatid': 20, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:13:56.000Z', 'chatName': 'New Chat'},
//     {'chatid': 21, 'uname': 'ExOfficer1', 'lastchatdate': '2025-09-24T10:44:25.000Z', 'chatName': 'New Chat'}
//   ];

//   return (
//     <div className="h-screen w-full bg-[#fafafa] dark:bg-[#2d3748] relative">
//       <div className="h-full flex items-center justify-center pl-80 pr-80">
//         <div className="text-center opacity-60">
//           <h1 className="text-2xl font-semibold mb-2">Main Content Area</h1>
//           <p>Chat history on the left, tools panel on the right</p>
//         </div>
//       </div>
      
//       <ChatHistorySidebar 
//         chatHistory={sampleChatHistory}
//         theme="light"
//         activeChatId={activeChatId}
//         onChatSelect={(id) => {
//           setActiveChatId(id);
//           console.log('Selected chat:', id);
//         }}
//         onNewChat={() => console.log('New chat clicked')}
//       />
//     </div>
//   );
// }