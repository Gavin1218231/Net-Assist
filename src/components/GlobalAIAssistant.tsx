import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2, Maximize2, Trash2, Sparkles } from 'lucide-react';
import { useAIAssistant } from '../context/AIAssistantContext';
import { useAuth } from '../context/AuthContext';

export default function GlobalAIAssistant() {
  const { isAuthenticated } = useAuth();
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    suggestions,
    unreadCount,
    toggleAssistant,
    closeAssistant,
    minimizeAssistant,
    maximizeAssistant,
    sendMessage,
    clearMessages,
  } = useAIAssistant();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived, not stored: suggestions show only until the user's first message.
  const showSuggestions = messages.every(m => m.role !== 'user');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Don't show for non-authenticated users
  if (!isAuthenticated) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating action button
  if (!isOpen) {
    return (
      <button
        onClick={toggleAssistant}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-bg shadow-lg flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={maximizeAssistant}
        className="fixed bottom-20 right-4 z-50 px-4 py-2 rounded-full gradient-bg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
        aria-label="Expand AI Assistant"
      >
        <Bot className="w-5 h-5 text-white" />
        <span className="text-white text-sm font-medium">NetAssist AI</span>
        {unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <Maximize2 className="w-4 h-4 text-white/80" />
      </button>
    );
  }

  // Full chat panel
  return (
    <div className="fixed bottom-16 right-4 z-50 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-[var(--color-bg)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">NetAssist AI</h3>
            <p className="text-white/70 text-[10px]">Your internet assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={minimizeAssistant}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={closeAssistant}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                msg.role === 'assistant'
                  ? 'gradient-bg text-white'
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
              }`}
            >
              {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : 'You'}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-bl-md'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed prose-sm">
                {msg.content.split('\n').map((line, idx) => {
                  // Handle bold text
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={pIdx}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors border border-[var(--color-border)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--color-border)] p-3 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything about your network..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="input-field !py-2.5 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary !py-2.5 !px-4 shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
