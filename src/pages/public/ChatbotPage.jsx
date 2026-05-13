import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { sendMessage } from '../../services/chatService';

const ChatbotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLearner = user?.role === 'LEARNER';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isDark = isLearner || isInstructor;

  const Wrapper = isLearner
    ? LearnerLayout
    : isInstructor
    ? InstructorLayout
    : Layout;

  const theme = isInstructor ? {
    accent: '16,185,129',
    accentHex: '#10b981',
    accentLight: '#6ee7b7',
    accentBg: 'rgba(16,185,129,0.1)',
    accentBorder: 'rgba(16,185,129,0.2)',
    cardBg: '#0d1a14',
    cardBorder: 'rgba(16,185,129,0.15)',
    msgBg: 'rgba(16,185,129,0.08)',
    msgBorder: 'rgba(16,185,129,0.15)',
    aiBg: 'linear-gradient(135deg, #10b981, #059669)',
    userBg: 'linear-gradient(135deg, #10b981, #059669)',
    suggBg: 'rgba(16,185,129,0.1)',
    suggBorder: 'rgba(16,185,129,0.2)',
    suggColor: '#6ee7b7',
  } : {
    accent: '139,92,246',
    accentHex: '#8b5cf6',
    accentLight: '#c4b5fd',
    accentBg: 'rgba(139,92,246,0.1)',
    accentBorder: 'rgba(139,92,246,0.2)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(139,92,246,0.15)',
    msgBg: 'rgba(139,92,246,0.08)',
    msgBorder: 'rgba(139,92,246,0.15)',
    aiBg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    userBg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    suggBg: 'rgba(139,92,246,0.1)',
    suggBorder: 'rgba(139,92,246,0.2)',
    suggColor: '#c4b5fd',
  };

  const [messages, setMessages] = useState([{
    id: 1,
    type: 'bot',
    text: "Bonjour ! 👋 Je suis votre assistant E-Learning. Dites-moi ce que vous souhaitez apprendre et je vous recommanderai les meilleures formations !",
    recommendations: []
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      recommendations: []
    }]);
    setLoading(true);
    try {
      const data = await sendMessage(userMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: data.reply,
        recommendations: data.recommendations || []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        recommendations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Je veux apprendre Java',
    'Formations en Python',
    'Développement web',
    'Base de données SQL',
    'Applications mobiles',
  ];

  const chatContainerStyle = isDark ? {
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: '24px',
  } : {
    background: 'white',
    border: '1px solid #f0f0f0',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  };

  const msgAreaStyle = isDark ? {
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '24px 24px 0 0',
  } : {
    background: '#f9fafb',
    borderRadius: '24px 24px 0 0',
  };

  const botBubbleStyle = isDark ? {
    background: theme.msgBg,
    border: `1px solid ${theme.msgBorder}`,
    color: 'rgba(255,255,255,0.9)',
    borderRadius: '20px 20px 20px 4px',
  } : {
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    color: '#374151',
    borderRadius: '20px 20px 20px 4px',
  };

  return (
    <Wrapper>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 text-sm font-semibold"
            style={{
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentLight,
            }}>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: theme.accentHex }} />
            Assistant IA actif
          </motion.div>
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Assistant E-Learning 🤖
          </h1>
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>
            Posez vos questions et je vous recommande les meilleures formations
          </p>
        </div>

        {/* Chat container */}
        <div style={chatContainerStyle}>

          {/* Zone messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4" style={msgAreaStyle}>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}>

                  <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1 text-white text-xs font-bold"
                        style={{ background: theme.aiBg }}>
                        AI
                      </div>
                    )}
                    <div className="max-w-sm px-4 py-3 text-sm"
                      style={msg.type === 'user' ? {
                        background: theme.userBg,
                        color: 'white',
                        borderRadius: '20px 20px 4px 20px',
                        boxShadow: `0 4px 15px rgba(${theme.accent},0.3)`,
                      } : botBubbleStyle}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Recommandations */}
                  {msg.recommendations?.length > 0 && (
                    <div className="ml-11 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.recommendations.map(course => (
                        <motion.div
                          key={course.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="p-3 rounded-xl cursor-pointer transition"
                          style={isDark ? {
                            background: theme.accentBg,
                            border: `1px solid ${theme.accentBorder}`,
                          } : {
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}>
                          <div className="text-xs font-semibold mb-1"
                            style={{ color: theme.accentHex }}>
                            {course.categoryName || 'Formation'}
                          </div>
                          <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {course.title}
                          </div>
                          <div className="text-xs"
                            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>
                            Par {course.instructorName} • {course.level}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-xs font-bold"
                  style={{ background: theme.aiBg }}>
                  AI
                </div>
                <div className="px-4 py-3 rounded-2xl" style={botBubbleStyle}>
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <motion.div
                        key={d}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d / 1000 }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: theme.accentHex }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-6 py-3 flex gap-2 overflow-x-auto"
            style={{ borderTop: `1px solid ${isDark ? `rgba(${theme.accent},0.1)` : '#f0f0f0'}` }}>
            {suggestions.map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setInput(s)}
                className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 font-medium"
                style={{
                  background: theme.suggBg,
                  border: `1px solid ${theme.suggBorder}`,
                  color: theme.suggColor,
                }}>
                {s}
              </motion.button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 flex gap-3"
            style={{ borderTop: `1px solid ${isDark ? `rgba(${theme.accent},0.1)` : '#f0f0f0'}` }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={loading}
              className="flex-1 text-sm outline-none rounded-xl px-4 py-2.5"
              style={isDark ? {
                background: theme.accentBg,
                border: `1px solid ${theme.accentBorder}`,
                color: 'white',
              } : {
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#111827',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${theme.accentHex}, ${isInstructor ? '#059669' : '#6366f1'})`,
                boxShadow: `0 4px 12px rgba(${theme.accent},0.3)`,
              }}>
              Envoyer
            </motion.button>
          </form>
        </div>
      </div>
    </Wrapper>
  );
};

export default ChatbotPage;