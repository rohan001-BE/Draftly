'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  Copy,
  MessageCircle,
  FileText,
  ChevronDown,
  Loader2,
  RefreshCw,
  Info,
  CornerDownLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TopNavbar } from '@/components/common/top-navbar';
import { Sidebar } from '@/components/common/sidebar';
import { AnimatedBackground } from '@/components/common/animated-background';
import { useAuth } from '@/hooks';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  selectedDocId: string | null;
  model: string;
  createdAt: number;
}

// Groq models list
const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Smart)', desc: 'Best for complex reasoning and summaries' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)', desc: 'Super fast lightweight responses' }
];

const SUGGESTION_TOPICS = [
  'Summarize my document',
  'Suggest formatting improvements',
  'Draft a professional response',
  'Generate action items checklist',
];

// Helper to convert Tiptap JSON to plain text
function tiptapToPlainText(node: any): string {
  if (!node) return '';
  if (node.text) return node.text;
  if (Array.isArray(node)) {
    return node.map(tiptapToPlainText).join('\n');
  }
  if (node.content && Array.isArray(node.content)) {
    const text = node.content.map(tiptapToPlainText).join(
      node.type === 'paragraph' || node.type === 'heading' ? '\n' : ' '
    );
    return text;
  }
  return '';
}

export default function ChatPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  
  // App states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // UI states
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authentication Redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch documents for the selector dropdown
  useEffect(() => {
    if (!user) return;
    
    async function fetchDocs() {
      setDocsLoading(true);
      try {
        const res = await fetch('/api/documents');
        const json = await res.json();
        if (res.ok && json.success) {
          const owned = json.data.owned || [];
          const shared = (json.data.shared || []).map((s: any) => s.document);
          setDocuments([...owned, ...shared]);
        }
      } catch (err) {
        console.error('Failed to load documents', err);
      } finally {
        setDocsLoading(false);
      }
    }
    
    void fetchDocs();
  }, [user]);

  // Load chat conversations from localStorage on user change
  useEffect(() => {
    if (!user?.id) return;
    
    try {
      const saved = localStorage.getItem(`draftly_chats_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Conversation[];
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveChatId(parsed[0].id);
          return;
        }
      }
      
      // Initialize with a default conversation if none exists
      const defaultChat: Conversation = {
        id: `chat-${Date.now()}`,
        title: 'New Chat Session',
        messages: [
          {
            id: 'welcome',
            role: 'assistant',
            text: 'Hi, I am Draftly Assistant. You can chat with me generally, or select a document from the reference dropdown at the top to chat with, summarize, or edit its content.',
            timestamp: Date.now(),
          }
        ],
        selectedDocId: null,
        model: 'llama-3.3-70b-versatile',
        createdAt: Date.now(),
      };
      setConversations([defaultChat]);
      setActiveChatId(defaultChat.id);
    } catch (e) {
      console.error('Error loading conversations', e);
    }
  }, [user?.id]);

  // Save chat conversations to localStorage when they change
  useEffect(() => {
    if (!user?.id || conversations.length === 0) return;
    localStorage.setItem(`draftly_chats_${user.id}`, JSON.stringify(conversations));
  }, [conversations, user?.id]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeChatId, isSending, scrollToBottom]);

  // Computed values for active conversation
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || null;
  }, [conversations, activeChatId]);

  const activeDoc = useMemo(() => {
    if (!activeChat?.selectedDocId) return null;
    return documents.find((doc) => doc.id === activeChat.selectedDocId) || null;
  }, [documents, activeChat?.selectedDocId]);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  // Start a new chat session
  const handleNewChat = () => {
    const newChat: Conversation = {
      id: `chat-${Date.now()}`,
      title: `AI Assistant Chat ${conversations.length + 1}`,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: 'Started a new session. How can I help you write, edit, or collaborate today?',
          timestamp: Date.now(),
        }
      ],
      selectedDocId: activeChat?.selectedDocId || null,
      model: activeChat?.model || 'llama-3.3-70b-versatile',
      createdAt: Date.now(),
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setShowHistoryPanel(false);
  };

  // Delete a chat session
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't delete if it's the last chat
    if (conversations.length === 1) {
      showErrorToast('You must keep at least one chat session.');
      return;
    }

    const index = conversations.findIndex((c) => c.id === id);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);

    if (activeChatId === id) {
      const nextActiveIndex = index > 0 ? index - 1 : 0;
      setActiveChatId(updated[nextActiveIndex].id);
    }
    showSuccessToast('Chat session deleted');
  };

  // Clear messages inside the active chat session
  const handleClearMessages = () => {
    if (!activeChatId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [
              {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                text: 'Chat history cleared. How can I help you now?',
                timestamp: Date.now(),
              }
            ],
          };
        }
        return c;
      })
    );
    showSuccessToast('Chat cleared');
  };

  // Start inline editing of chat session name
  const handleStartEditTitle = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitleText(currentTitle);
  };

  // Save inline editing of chat session name
  const handleSaveTitle = (id: string) => {
    if (!editTitleText.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitleText.trim() } : c))
    );
    setEditingChatId(null);
  };

  // Handle active document change in selector dropdown
  const handleDocChange = (docId: string | null) => {
    if (!activeChatId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, selectedDocId: docId } : c))
    );
    showSuccessToast(
      docId
        ? `Linked document context: "${documents.find((d) => d.id === docId)?.title}"`
        : 'Context cleared (General Chat Mode)'
    );
  };

  // Handle LLM model change in selector dropdown
  const handleModelChange = (modelId: string) => {
    if (!activeChatId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, model: modelId } : c))
    );
    showSuccessToast(`Model switched to ${MODELS.find((m) => m.id === modelId)?.name}`);
  };

  // Send message to the proxy Groq route
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || draft).trim();
    if (!text || isSending || !activeChatId || !activeChat) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    // Add user message to active chat
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          // Auto-rename chat if it was the default name and this is the first message
          const defaultTitles = ['New Chat Session', 'AI Assistant Chat'];
          const shouldRename = defaultTitles.some((t) => c.title.startsWith(t)) && c.messages.length <= 1;
          const newTitle = shouldRename ? (text.length > 25 ? text.substring(0, 25) + '...' : text) : c.title;
          return {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      })
    );

    setDraft('');
    setIsSending(true);

    try {
      // Assemble conversation history for the LLM request
      const recentMessages = [...activeChat.messages, userMessage];

      // Add system prompt context if a document is selected
      let systemPrompt = 'You are Draftly, a premium AI document assistant designed to help users write, edit, summarize, format, and structure high-quality documents.';
      
      if (activeDoc) {
        const plainTextContent = tiptapToPlainText(activeDoc.content);
        systemPrompt += `\n\n[CONTEXT DOCUMENT]\nYou are currently helping the user with their active document titled "${activeDoc.title}". Here is the current text content of the document:\n---\n${plainTextContent}\n---\nUse this document content to answer questions, propose drafts, highlight formatting issues, or generate summaries. Refer to this content whenever requested.`;
      }

      // API Request to backend proxy
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          model: activeChat.model,
          systemPrompt,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.text) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: json.text,
          timestamp: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeChatId) {
              return { ...c, messages: [...c.messages, assistantMessage] };
            }
            return c;
          })
        );
      } else {
        throw new Error(json.error || 'Failed to fetch AI reply');
      }
    } catch (err: any) {
      console.error(err);
      showErrorToast(err?.message || 'Failed to connect to the AI model.');
      
      // Append a warning placeholder message
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: '⚠️ Sorry, I encountered an issue generating a response. Please verify that the Groq API key is set in your environment and try again.',
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return { ...c, messages: [...c.messages, errorMessage] };
          }
          return c;
        })
      );
    } finally {
      setIsSending(false);
    }
  };



  // Loading animation state for auth
  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background sm:flex-row">
      {/* Sidebar Navigation */}
      <div className="hidden sm:block">
        <Sidebar onLogout={handleLogout} showLogo={false} user={user} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
        {/* Top Header Navbar */}
        <TopNavbar user={user} onLogout={handleLogout} />

        {/* Chat Application Workspace */}
        <div className="relative flex-1 flex overflow-hidden">
          <AnimatedBackground variant="dashboard" />

          {/* INNER LAYOUT: Sidebar Chat History (260px) + Main Chat Area */}
          <div className="relative w-full h-full flex overflow-hidden z-10">
            
            {/* Conversation list panel - side drawer on mobile, static on desktop */}
            <aside
              className={`absolute inset-y-0 left-0 w-72 border-r border-slate-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 z-20 xl:relative xl:translate-x-0 ${
                showHistoryPanel ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex h-full flex-col p-4">
                {/* Panel Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Chats History
                    </span>
                  </div>
                  {/* Close panel on mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistoryPanel(false)}
                    className="h-8 w-8 rounded-lg xl:hidden"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                {/* New Chat Button */}
                <Button
                  onClick={handleNewChat}
                  className="mb-4 h-11 w-full rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/10 hover:opacity-95"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat Session
                </Button>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {conversations.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    const isEditing = chat.id === editingChatId;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setShowHistoryPanel(false);
                        }}
                        className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 flex-shrink-0" />
                        
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitleText}
                            onChange={(e) => setEditTitleText(e.target.value)}
                            onBlur={() => handleSaveTitle(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(chat.id);
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white dark:bg-slate-800 text-xs px-1.5 py-0.5 border border-blue-400 rounded outline-none"
                          />
                        ) : (
                          <span className="truncate text-xs font-semibold leading-none pr-12">
                            {chat.title}
                          </span>
                        )}

                        {/* Hover Actions */}
                        {!isEditing && (
                          <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={(e) => handleStartEditTitle(chat.id, chat.title, e)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              title="Rename chat"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete chat"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer details */}
                <div className="mt-auto border-t border-slate-200/50 dark:border-slate-800/40 pt-4 text-[10px] text-slate-400 font-medium">
                  Active User: <span className="text-slate-500 font-semibold">{user?.name}</span>
                </div>
              </div>
            </aside>

            {/* Backdrop overlay for history drawer on mobile */}
            {showHistoryPanel && (
              <div
                onClick={() => setShowHistoryPanel(false)}
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs z-10 xl:hidden"
              />
            )}

            {/* MAIN CHAT CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white/40 dark:bg-slate-900/10 backdrop-blur-xs">
              
              {/* Active Chat Header */}
              <header className="flex flex-col gap-3.5 border-b border-slate-200/60 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  {/* Toggle history panel on mobile */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowHistoryPanel((s) => !s)}
                    className="h-10 w-10 shrink-0 rounded-xl border-slate-200/80 bg-white/80 text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm xl:hidden"
                  >
                    <Menu className="h-4.5 w-4.5" />
                  </Button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
                      <h2 className="truncate text-base font-bold text-slate-800 dark:text-slate-200">
                        {activeChat?.title || 'Draftly AI'}
                      </h2>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      Secure and isolated document assistance
                    </p>
                  </div>
                </div>

                {/* Dropdowns Selector Options */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  
                  {/* Document selector dropdown */}
                  <div className="relative inline-block text-left min-w-[170px] max-w-[200px]">
                    <div className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-3 py-1.5 pr-8 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <select
                        value={activeChat?.selectedDocId || ''}
                        onChange={(e) => handleDocChange(e.target.value || null)}
                        disabled={docsLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="">General Assistant (None)</option>
                        {documents.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            📄 {doc.title}
                          </option>
                        ))}
                      </select>
                      <div className="truncate flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {activeDoc ? activeDoc.title : 'General Assistant'}
                        </span>
                      </div>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  {/* LLM Model selector dropdown */}
                  <div className="relative inline-block text-left min-w-[170px] max-w-[200px]">
                    <div className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-3 py-1.5 pr-8 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <select
                        value={activeChat?.model || 'llama-3.3-70b-versatile'}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        {MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            🤖 {m.name}
                          </option>
                        ))}
                      </select>
                      <div className="truncate flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                        <span className="truncate">
                          {MODELS.find((m) => m.id === activeChat?.model)?.name || 'Llama 3.3'}
                        </span>
                      </div>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  {/* Clear session action */}
                  <Button
                    variant="outline"
                    onClick={handleClearMessages}
                    className="h-8.5 rounded-xl border-red-200/60 hover:bg-red-50/60 dark:border-red-950/40 dark:hover:bg-red-950/20 text-red-600 text-xs px-3 shadow-sm hover:shadow"
                  >
                    Clear Chat
                  </Button>
                </div>
              </header>

              {/* Chat Message Lists Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6 flex flex-col bg-slate-50/30 dark:bg-slate-950/10">
                <AnimatePresence initial={false}>
                  {activeChat?.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 self-start max-w-[85%] bg-white/70 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/40 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm"
                    >
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
                      <span className="text-xs font-semibold text-slate-400 tracking-wide animate-pulse">
                        Draftly is typing...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips panel - show when conversation is empty / welcome state */}
              {activeChat && activeChat.messages.length <= 1 && (
                <div className="px-4 py-3 sm:px-6 bg-slate-50/40 dark:bg-slate-950/10 border-t border-slate-200/40 dark:border-slate-800/20">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Need Inspiration? Click one:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTION_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            let text = topic;
                            if (activeDoc) {
                              text = `${topic} for "${activeDoc.title}"`;
                            }
                            void handleSendMessage(text);
                          }}
                          className="rounded-xl border border-slate-200/80 hover:border-blue-400 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Input Footer Area */}
              <footer className="border-t border-slate-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 p-4 sm:px-6 backdrop-blur-md">
                {activeDoc && (
                  <div className="mb-3.5 inline-flex items-center gap-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/40 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold shadow-inner">
                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>
                      Referencing active document: <strong className="underline font-bold">{activeDoc.title}</strong>
                    </span>
                    <button
                      onClick={() => handleDocChange(null)}
                      className="ml-1 text-[10px] text-slate-400 hover:text-blue-600 transition"
                      title="Clear reference"
                    >
                      (un-link)
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={
                        activeDoc
                          ? `Ask anything about "${activeDoc.title}"...`
                          : "Ask assistant about your documents, formatting, workflows..."
                      }
                      className="pr-12 h-12 rounded-2xl bg-slate-100/70 border-slate-200/80 dark:bg-slate-950/40 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400/80 border border-slate-200/75 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md px-1.5 py-0.5 pointer-events-none shadow-sm">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                      <span>ENTER</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={isSending || !draft.trim()}
                    className="h-12 w-12 sm:w-auto sm:px-5 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:opacity-95 disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </footer>
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}

// Custom markdown parser
function renderMessageText(text: string) {
  if (!text) return null;

  // Split content by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, idx) => {
    // Code block rendering
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const lang = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <CodeBlock key={idx} lang={lang} code={code} />
      );
    }

    // Paragraphs, headers, and lists rendering
    const lines = part.split('\n');
    let insideList = false;
    let listType: 'ul' | 'ol' | null = null;
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`ul-${key}`} className="my-2.5 pl-6 list-disc space-y-1 text-slate-700 dark:text-slate-300">
              {listItems}
            </ul>
          );
        } else if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${key}`} className="my-2.5 pl-6 list-decimal space-y-1 text-slate-700 dark:text-slate-300">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        insideList = false;
        listType = null;
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();
      const uniqueKey = `${idx}-${lineIdx}`;

      // Check for headers
      if (trimmed.startsWith('# ')) {
        flushList(uniqueKey);
        elements.push(
          <h1 key={uniqueKey} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {parseInlineStyles(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(uniqueKey);
        elements.push(
          <h2 key={uniqueKey} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2">
            {parseInlineStyles(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList(uniqueKey);
        elements.push(
          <h3 key={uniqueKey} className="text-base font-semibold text-slate-900 dark:text-white mt-3 mb-1.5">
            {parseInlineStyles(trimmed.substring(4))}
          </h3>
        );
      }
      // Check for unordered lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (insideList && listType !== 'ul') {
          flushList(uniqueKey);
        }
        insideList = true;
        listType = 'ul';
        listItems.push(
          <li key={`li-${uniqueKey}`} className="text-sm leading-relaxed">
            {parseInlineStyles(trimmed.substring(2))}
          </li>
        );
      }
      // Check for ordered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        if (insideList && listType !== 'ol') {
          flushList(uniqueKey);
        }
        insideList = true;
        listType = 'ol';
        const content = trimmed.replace(/^\d+\.\s/, '');
        listItems.push(
          <li key={`li-${uniqueKey}`} className="text-sm leading-relaxed">
            {parseInlineStyles(content)}
          </li>
        );
      }
      // Empty line
      else if (!trimmed) {
        flushList(uniqueKey);
      }
      // Regular paragraph
      else {
        flushList(uniqueKey);
        elements.push(
          <p key={uniqueKey} className="text-sm leading-relaxed my-2 text-slate-700 dark:text-slate-300">
            {parseInlineStyles(line)}
          </p>
        );
      }
    });

    flushList(`end-${idx}`);
    return <div key={idx}>{elements}</div>;
  });
}

// Custom component for message bubble
function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    showSuccessToast('Copied message text!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-1.5 max-w-[85%] ${
        isAssistant ? 'self-start' : 'self-end items-end'
      }`}
    >
      <div className="flex items-center gap-2 px-2 text-[10px] uppercase tracking-wider text-slate-400">
        <span>{isAssistant ? 'Assistant' : 'You'}</span>
        <span>•</span>
        <span>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div
        className={`group relative rounded-3xl px-5 py-3.5 shadow-md border ${
          isAssistant
            ? 'bg-white/80 dark:bg-slate-900/80 border-slate-100/60 dark:border-slate-800/60 text-slate-950 dark:text-slate-100 rounded-tl-sm'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white rounded-tr-sm shadow-blue-500/10'
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm break-words leading-relaxed">
            {renderMessageText(message.text)}
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        )}

        {/* Floating actions */}
        <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${
          isAssistant ? '' : 'text-white/80'
        }`}>
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition ${
              isAssistant 
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Code Block with individual Copy button
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showSuccessToast('Copied code block!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
        <span>{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre"><code>{code}</code></pre>
    </div>
  );
}

function parseInlineStyles(line: string) {
  // Replace bold **text** and inline code `code`
  const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-rose-600 dark:text-rose-450 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
