import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const SUGGESTIONS = [
  'Can I substitute milk with curd?',
  'How do I make this recipe spicier?',
  'What can I cook in 15 minutes?',
  'Suggest a healthy breakfast using eggs and milk.',
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Sous Chef — no API key needed! Ask about substitutions, spice tips, quick meals, or healthy ideas.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text) => {
    const query = text || input;
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { query });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect. Make sure the backend is running on port 5000." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card mb-4 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] flex flex-col overflow-hidden !rounded-3xl"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold font-display">AI Sous Chef</h3>
                  <div className="flex items-center gap-1 opacity-80">
                    <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse" />
                    <span className="text-xs">Local assistant</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-emerald-50/30 to-white">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`mt-1 p-1.5 rounded-lg ${m.role === 'user' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-700 rounded-bl-sm border border-emerald-100 shadow-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-1 p-3 bg-white rounded-2xl w-fit border border-emerald-100">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-2 rounded-full hover:bg-emerald-50 transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-emerald-50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-300 focus:outline-none text-sm"
                />
                <button
                  onClick={() => sendMessage()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-2xl shadow-emerald-300/50 text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
      >
        <MessageSquare size={24} />
        {!isOpen && <span className="font-bold text-sm pr-1">Ask Sous Chef</span>}
      </button>
    </div>
  );
};

export default Chatbot;
