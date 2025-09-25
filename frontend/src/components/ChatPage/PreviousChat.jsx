import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Plus, 
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ChatHistorySidebar = ({
  Chat = [],
  theme = 'light',
  onChatSelect,
  onNewChat,
  activeChatId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const isDark = theme === 'dark';

  // Filter and sort chats
  const filteredAndSortedChats = useMemo(() => {
    let filtered = Chat.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by timestamp descending (newest first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [Chat, searchTerm]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
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
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              layout
              className={`${cardClasses} ${activeChatId === chat.id ? activeChatClasses : ''} border rounded-lg p-2 mb-2 cursor-pointer transition-all duration-200 group relative`}
              onClick={() => onChatSelect(chat.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeChatId === chat.id 
                      ? 'bg-[#10b981]' 
                      : isDark ? 'bg-[#4a5568]' : 'bg-[#e5e7eb]'
                  }`}>
                    <MessageSquare className={`w-3 h-3 ${
                      activeChatId === chat.id 
                        ? 'text-white' 
                        : isDark ? 'text-[#9ca3af]' : 'text-[#6b7280]'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      activeChatId === chat.id ? 'text-[#10b981]' : ''
                    }`}>
                      {chat.name}
                    </p>
                    
                    <div className="flex items-center mt-1">
                      <Clock className={`h-3 w-3 mr-1 opacity-50`} />
                      <span className={`text-xs opacity-50`}>
                        {formatTime(chat.timestamp)}
                      </span>
                    </div>

                    {chat.lastMessage && (
                      <p className={`text-xs mt-1 opacity-60 truncate`}>
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Active indicator */}
              {activeChatId === chat.id && (
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