// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Search, 
//   Plus, 
//   Minus, 
//   Lock, 
//   Settings, 
//   Filter,
//   X,
//   Check,
//   AlertTriangle
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// interface Tool {
//   id: number;
//   name: string;
//   description: string;
//   available: number;
// }

// interface ToolsPanelProps {
//   tools: Tool[];
//   theme?: string;
//   onAddToContext?: (toolId: number) => void;
//   onRemoveFromContext?: (toolId: number) => void;
//   onRequestAccess?: (toolId: number) => void;
// }

// export const ToolsPanel: React.FC<ToolsPanelProps> = ({
//   tools,
//   theme = 'light',
//   onAddToContext,
//   onRemoveFromContext,
//   onRequestAccess
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filter, setFilter] = useState<'all' | 'accessible' | 'inaccessible'>('all');
//   const [contextTools, setContextTools] = useState<Set<number>>(new Set());
//   const [requestingAccess, setRequestingAccess] = useState<number | null>(null);
//   const [requestedAccess, setRequestedAccess] = useState<Set<number>>(new Set());

//   const isDark = theme === 'dark';

//   const filteredTools = useMemo(() => {
//     let filtered = tools.filter(tool =>
//       tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tool.description.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     switch (filter) {
//       case 'accessible':
//         filtered = filtered.filter(tool => tool.available === 1);
//         break;
//       case 'inaccessible':
//         filtered = filtered.filter(tool => tool.available === 0);
//         break;
//       default:
//         break;
//     }

//     return filtered;
//   }, [tools, searchTerm, filter]);

//   const handleToolAction = (tool: Tool) => {
//     if (tool.available === 1) {
//       if (contextTools.has(tool.id)) {
//         setContextTools(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(tool.id);
//           return newSet;
//         });
//         onRemoveFromContext?.(tool.id);
//       } else {
//         setContextTools(prev => new Set(prev).add(tool.id));
//         onAddToContext?.(tool.id);
//       }
//     } else {
//       setRequestingAccess(tool.id);
//     }
//   };

//   const confirmRequestAccess = (toolId: number) => {
//     setRequestedAccess(prev => new Set(prev).add(toolId));
//     onRequestAccess?.(toolId);
//     setRequestingAccess(null);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, x: 20 },
//     visible: {
//       opacity: 1,
//       x: 0,
//       transition: {
//         duration: 0.3,
//         staggerChildren: 0.05
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 10 },
//     visible: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
//   };

//   const overlayVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 },
//     exit: { opacity: 0 }
//   };

//   const modalVariants = {
//     hidden: { opacity: 0, scale: 0.95, y: 20 },
//     visible: { opacity: 1, scale: 1, y: 0 },
//     exit: { opacity: 0, scale: 0.95, y: 20 }
//   };

//   const baseClasses = isDark
//     ? 'bg-[#2d3748] border-[#4a5568] text-[#e2e8f0]'
//     : 'bg-[#fafafa] border-[#e5e5e5] text-[#2a2a2a]';

//   const cardClasses = isDark
//     ? 'bg-[#374151] border-[#4b5563] hover:bg-[#3f4654]'
//     : 'bg-white border-[#e0e0e0] hover:bg-[#f8f8f8]';

//   const buttonClasses = isDark
//     ? 'bg-[#4b5563] hover:bg-[#5b6575] hover:text-white text-[#e2e8f0]'
//     : 'bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#2a2a2a]';

//   return (
//     <>
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className={`h-full w-1/6 ${baseClasses} border-l flex flex-col fixed right-0 top-0 z-40`}
//       >
//         {/* Header */}
//         <div className="p-4 border-b border-inherit">
//           <div className="flex items-center gap-2 mb-4">
//             <Settings className="w-5 h-5 text-[#10b981]" />
//             <h2 className="font-semibold text-lg">Tools</h2>
//           </div>

//           {/* Search */}
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <Input
//               placeholder="Search tools..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`pl-10 ${isDark ? 'bg-[#4a5568] border-[#5b6575]' : 'bg-white border-[#d0d0d0]'}`}
//             />
//           </div>

//           {/* Filters */}
//           <div className="flex gap-1">
//             {(['all', 'accessible', 'inaccessible'] as const).map((f) => (
//               <Button
//                 key={f}
//                 variant={filter === f ? "default" : "ghost"}
//                 size="sm"
//                 onClick={() => setFilter(f)}
//                 className={`text-xs capitalize ${
//                   filter === f
//                     ? 'bg-[#10b981] text-white hover:bg-[#059669]'
//                     : buttonClasses
//                 }`}
//               >
//                 <Filter className="w-3 h-3 mr-1" />
//                 {f === 'inaccessible' ? 'Locked' : f}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Tools List */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           <AnimatePresence mode="popLayout">
//             {filteredTools.map((tool) => (
//               <motion.div
//                 key={tool.id}
//                 variants={itemVariants}
//                 layout
//                 exit="exit"
//                 className={`${cardClasses} border rounded-lg p-3 transition-all duration-200 cursor-pointer`}
//                 onClick={() => handleToolAction(tool)}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <h3 className="font-medium text-sm truncate">
//                         {tool.name.replace(/_/g, ' ')}
//                       </h3>
//                       {tool.available === 0 && (
//                         <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />
//                       )}
//                     </div>
//                     <p className="text-xs opacity-70 line-clamp-2">
//                       {tool.description}
//                     </p>
//                   </div>
                  
//                   <motion.div
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     className="flex-shrink-0"
//                   >
//                     {tool.available === 1 ? (
//                       contextTools.has(tool.id) ? (
//                         <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
//                           <Minus className="w-3 h-3 text-white" />
//                         </div>
//                       ) : (
//                         <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center">
//                           <Plus className="w-3 h-3 text-white" />
//                         </div>
//                       )
//                     ) : (
//                       <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
//                         <Lock className="w-3 h-3 text-white" />
//                       </div>
//                     )}
//                   </motion.div>
//                 </div>

//                 {/* Status indicator */}
//                 <div className="mt-2 flex items-center gap-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       tool.available === 1 ? 'bg-green-400' : 'bg-red-400'
//                     }`}
//                   />
//                   <span className="text-xs opacity-60">
//                     {tool.available === 1 ? 'Available' : requestedAccess.has(tool.id) ? 'Request Sent' : 'Request Access'}
//                   </span>
//                   {contextTools.has(tool.id) && (
//                     <span className="text-xs bg-[#10b981] text-white px-1.5 py-0.5 rounded">
//                       Active
//                     </span>
//                   )}
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>

//           {filteredTools.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-8 opacity-60"
//             >
//               <p className="text-sm">No tools found</p>
//             </motion.div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-4 border-t border-inherit">
//           <div className="text-xs opacity-60">
//             {contextTools.size} tools in context
//           </div>
//         </div>
//       </motion.div>

//       {/* Request Access Modal */}
//       <AnimatePresence>
//         {requestingAccess !== null && (
//           <>
//             <motion.div
//               variants={overlayVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               className="fixed inset-0 bg-black/50 z-50"
//               onClick={() => setRequestingAccess(null)}
//             />
//             <motion.div
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${cardClasses} rounded-lg p-6 z-50 w-80 border shadow-2xl ${isDark == true ? "text-[#dfdfdf]" : "text-black"}`}
//             >
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center">
//                   <AlertTriangle className="w-5 h-5 text-[#10b981]" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Request Access</h3>
//                   <p className="text-sm opacity-70">Confirm your request</p>
//                 </div>
//               </div>
              
//               <p className="text-sm mb-6 opacity-80">
//                 Are you sure you want to request access to{' '}
//                 <span className="font-medium">
//                   {tools.find(t => t.id === requestingAccess)?.name.replace(/_/g, ' ')}
//                 </span>
//                 ?
//               </p>
              
//               <div className="flex gap-3">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setRequestingAccess(null)}
//                   className={buttonClasses}
//                 >
//                   <X className="w-4 h-4 mr-2" />
//                   Cancel
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={() => confirmRequestAccess(requestingAccess)}
//                   className="bg-[#10b981] text-white hover:bg-[#059669] flex-1"
//                 >
//                   <Check className="w-4 h-4 mr-2" />
//                   Request Access
//                 </Button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// // Example usage
// // export default function App() {
// //   const tools = [
// //     {'id': 1, 'name': 'Create_Placement', 'description': 'Create a new placement entry', 'available': 0},
// //     {'id': 2, 'name': 'Read_Placement', 'description': 'Fetch placement entries', 'available': 1},
// //     {'id': 3, 'name': 'Update_Placement', 'description': 'Update placement entry', 'available': 0},
// //     {'id': 4, 'name': 'Delete_Placement', 'description': 'Delete placement entry', 'available': 0},
// //     {'id': 5, 'name': 'Create_ExamCell', 'description': 'Create a new exam entry', 'available': 1},
// //     {'id': 6, 'name': 'Read_ExamCell', 'description': 'Fetch exam entries', 'available': 1},
// //     {'id': 7, 'name': 'Update_ExamCell', 'description': 'Update exam entry', 'available': 1},
// //     {'id': 8, 'name': 'Delete_ExamCell', 'description': 'Delete exam entry', 'available': 1},
// //     {'id': 9, 'name': 'Create_Transport', 'description': 'Create a new transport entry', 'available': 1},
// //     {'id': 10, 'name': 'Read_Transport', 'description': 'Fetch transport entries', 'available': 1},
// //     {'id': 11, 'name': 'Update_Transport', 'description': 'Update transport entry', 'available': 1},
// //     {'id': 12, 'name': 'Delete_Transport', 'description': 'Delete transport entry', 'available': 1}
// //   ];

// //   return (
// //     <div className="h-screen w-full bg-[#383838] dark:bg-[#2d3748] relative">
// //       <div className="h-full flex items-center justify-center pr-80">
// //         <div className="text-center opacity-60">
// //           <h1 className="text-2xl font-semibold mb-2">Main Content Area</h1>
// //           <p>The tools panel is positioned on the right side</p>
// //         </div>
// //       </div>
      
// //       <ToolsPanel 
// //         tools={tools}
// //         theme="dark"
// //         onAddToContext={(id) => console.log('Added to context:', id)}
// //         onRemoveFromContext={(id) => console.log('Removed from context:', id)}
// //         onRequestAccess={(id) => console.log('Requesting access for:', id)}
// //       />
// //     </div>
// //   );
// // }