import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../../components/Layout';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { sendMessage } from '../../services/chatService';

const ChatbotPage = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const isLearner    = user?.role === 'LEARNER';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const Wrapper = isLearner ? LearnerLayout : isInstructor ? InstructorLayout : Layout;
  const baseAccent = isInstructor ? '#10b981' : '#8b5cf6';

  const t = {
    textPrimary:     dark ? '#ffffff'                : '#111827',
    textSub:         dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    surface:         dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:      dark ? 'rgba(255,255,255,0.02)' : '#f4f4f5',
    border:          dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:          dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent:          baseAccent,
    accentBg:        dark ? `${baseAccent}20`        : `${baseAccent}10`,
    accentBorder:    dark ? `${baseAccent}35`        : `${baseAccent}22`,
    accentText:      dark
      ? (isInstructor ? '#6ee7b7' : '#c4b5fd')
      : (isInstructor ? '#059669' : '#7c3aed'),
    msgAreaBg:       dark ? 'rgba(0,0,0,0.15)'       : '#f8f9fa',
    botBubbleBg:     dark ? `${baseAccent}14`        : '#ffffff',
    botBubbleBorder: dark ? `${baseAccent}25`        : '#ebebeb',
    botBubbleText:   dark ? 'rgba(255,255,255,0.88)' : '#374151',
  };

  const [messages, setMessages] = useState([{
    id: 1, type: 'bot',
    text: "Bonjour ! Je suis votre assistant E-Learning. Dites-moi ce que vous souhaitez apprendre et je vous recommanderai les meilleures formations !",
    recommendations: [],
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
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMessage, recommendations: [] }]);
    setLoading(true);
    try {
      const data = await sendMessage(userMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        text: data.reply,
        recommendations: data.recommendations || [],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        recommendations: [],
      }]);
    } finally { setLoading(false); }
  };

  const suggestions = [
    'Je veux apprendre Java',
    'Formations en Python',
    'Développement web',
    'Base de données SQL',
    'Applications mobiles',
  ];

  return (
    <Wrapper>
      {/* Conteneur pleine hauteur — pas de scroll de page */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)', // 80px = hauteur navbar
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* ── Header compact ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', paddingBottom: 16, flexShrink: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99, marginBottom: 8,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
            color: t.accentText, fontSize: 12, fontWeight: 600,
          }}>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, display: 'inline-block' }} />
            Assistant IA actif
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary, margin: '0 0 4px' }}>
            Assistant E-Learning
          </h1>
          <p style={{ fontSize: 13, color: t.textSub, margin: 0 }}>
            Posez vos questions et je vous recommande les meilleures formations
          </p>
        </motion.div>

        {/* ── Boîte chat — prend tout l'espace restant ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          overflow: 'hidden',
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
          minHeight: 0, // crucial pour que flex fonctionne
        }}>

          {/* Zone messages — scroll uniquement ici */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: t.msgAreaBg,
            scrollbarWidth: 'thin',
            scrollbarColor: `${t.accent}40 transparent`,
          }}>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}>

                  <div style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.type === 'bot' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: t.accent, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        marginRight: 10, flexShrink: 0, marginTop: 2,
                      }}>
                        AI
                      </div>
                    )}
                    <div style={{
                      maxWidth: '70%', padding: '10px 16px', fontSize: 13, lineHeight: 1.6,
                      ...(msg.type === 'user' ? {
                        background: t.accent, color: 'white',
                        borderRadius: '18px 18px 4px 18px',
                      } : {
                        background: t.botBubbleBg,
                        border: `1px solid ${t.botBubbleBorder}`,
                        color: t.botBubbleText,
                        borderRadius: '18px 18px 18px 4px',
                        boxShadow: dark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
                      }),
                    }}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Recommandations */}
                  {msg.recommendations?.length > 0 && (
                    <div style={{
                      marginLeft: 38, marginTop: 10,
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: 8,
                    }}>
                      {msg.recommendations.map(course => (
                        <motion.div key={course.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          onClick={() => navigate(`/courses/${course.id}`)}
                          style={{
                            padding: 12, borderRadius: 12, cursor: 'pointer',
                            background: t.surface, border: `1px solid ${t.border}`,
                            boxShadow: dark ? 'none' : '0 1px 6px rgba(0,0,0,0.04)',
                          }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: t.accent, marginBottom: 3 }}>
                            {course.categoryName || 'Formation'}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary, marginBottom: 3 }}>
                            {course.title}
                          </div>
                          <div style={{ fontSize: 10, color: t.textSub }}>
                            Par {course.instructorName} · {course.level}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading dots */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: t.accent,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, marginRight: 10, flexShrink: 0,
                }}>
                  AI
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                  background: t.botBubbleBg, border: `1px solid ${t.botBubbleBorder}`,
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 150, 300].map(d => (
                      <motion.div key={d}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d / 1000 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div style={{
            padding: '10px 16px',
            borderTop: `1px solid ${t.border}`,
            display: 'flex', gap: 8, overflowX: 'auto',
            flexShrink: 0, scrollbarWidth: 'none',
          }}>
            {suggestions.map(s => (
              <motion.button key={s}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setInput(s)}
                style={{
                  fontSize: 11, padding: '5px 12px', borderRadius: 99,
                  whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 500,
                  background: t.accentBg, border: `1px solid ${t.accentBorder}`,
                  color: t.accentText, cursor: 'pointer',
                }}>
                {s}
              </motion.button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: '12px 16px',
            borderTop: `1px solid ${t.border}`,
            display: 'flex', gap: 10, flexShrink: 0,
          }}>
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={loading}
              style={{
                flex: 1, fontSize: 13, outline: 'none',
                borderRadius: 12, padding: '10px 16px',
                background: t.surfaceSub, border: `1px solid ${t.border}`,
                color: t.textPrimary,
              }} />
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 20px', borderRadius: 12,
                fontWeight: 600, color: 'white', fontSize: 13,
                background: t.accent, border: 'none', cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
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