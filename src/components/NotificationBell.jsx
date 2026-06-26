import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotifications, getUnreadCount, markAllAsRead, markAsRead,
  archiveNotification, restoreNotification, archiveAllRead,
} from '../services/notificationService';

const TypeIcon = ({ type }) => {
  if (type === 'ENROLLMENT') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#6366f1" strokeWidth="2">
      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
      <path d="M12 14l6.16-3.422A12.083 12.083 0 0122 17H2a12.083 12.083 0 013.84-6.422L12 14z"/>
    </svg>
  );
  if (type === 'COURSE_APPROVED') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#10b981" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  if (type === 'COURSE_REJECTED') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#ef4444" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
  if (type === 'NEW_COURSE') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#f59e0b" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
  if (type === 'NEW_APPLICATION') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#8b5cf6" strokeWidth="2">
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
    </svg>
  );
  if (type === 'VIDEO_PENDING') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#6366f1" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#6366f1" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
};

const NotificationBell = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('ACTIVE'); // 'ACTIVE' | 'ARCHIVED'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingArchiveAll, setLoadingArchiveAll] = useState(false);
  const ref = useRef(null);

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const dropBg = dark ? '#0d0d1a' : '#ffffff';
  const border = dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb';
  const unreadBg = dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)';
  const hoverBg = dark ? 'rgba(99,102,241,0.12)' : '#f9fafb';

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recharger quand la vue change
  useEffect(() => {
    if (open) loadNotifications();
  }, [view, open]);

  const loadCount = async () => {
    try { setUnreadCount(await getUnreadCount()); } catch {}
  };

  const loadNotifications = async () => {
    try {
      setNotifications(await getNotifications(view === 'ARCHIVED'));
    } catch (err) { console.error(err); }
  };

  const handleOpen = async () => {
    setOpen(prev => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleArchiveAllRead = async () => {
    setLoadingArchiveAll(true);
    try {
      await archiveAllRead();
      await loadCount();
      setNotifications(notifications.filter(n => !n.read));
    } catch (err) { console.error(err); }
    finally { setLoadingArchiveAll(false); }
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.id);
      setNotifications(notifications.map(n =>
        n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    await archiveNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
    await loadCount();
  };

  const handleRestore = async (e, id) => {
    e.stopPropagation();
    await restoreNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  const readCount = notifications.filter(n => n.read).length;

  return (
    <div className="relative" ref={ref}>
      {/* Bouton cloche */}
      <button onClick={handleOpen}
        className="relative p-2 rounded-xl transition"
        style={{
          background: open
            ? dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)'
            : 'transparent',
        }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"
          stroke={dark ? '#a5b4fc' : '#6366f1'} strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-96 rounded-2xl z-50 overflow-hidden"
            style={{
              background: dropBg,
              border: `1px solid ${border}`,
              boxShadow: dark
                ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)'
                : '0 20px 40px rgba(0,0,0,0.12)',
            }}>

            {/* Header */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: textPrimary }}>
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {view === 'ACTIVE' && unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition">
                      Tout lire
                    </button>
                  )}
                  {view === 'ACTIVE' && readCount > 0 && (
                    <button onClick={handleArchiveAllRead}
                      disabled={loadingArchiveAll}
                      className="text-xs font-medium transition disabled:opacity-40"
                      style={{ color: textSub }}>
                      {loadingArchiveAll ? '...' : 'Archiver les lues'}
                    </button>
                  )}
                </div>
              </div>

              {/* Toggle Actives / Historique */}
              <div className="flex rounded-xl p-0.5 gap-0.5"
                style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6' }}>
                {[{ key: 'ACTIVE', label: 'Actives' }, { key: 'ARCHIVED', label: 'Historique' }].map(v => (
                  <button key={v.key} onClick={() => setView(v.key)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition"
                    style={view === v.key ? {
                      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                      color: 'white',
                    } : { color: textSub }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 mx-auto mb-3 opacity-20"
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  <p className="text-sm" style={{ color: textSub }}>
                    {view === 'ARCHIVED' ? 'Aucune notification archivée' : 'Aucune notification'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0, padding: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => view === 'ACTIVE' && handleClick(notif)}
                      className="flex gap-3 px-4 py-3 group relative"
                      style={{
                        borderBottom: `1px solid ${border}`,
                        background: !notif.read && view === 'ACTIVE' ? unreadBg : 'transparent',
                        cursor: view === 'ACTIVE' ? 'pointer' : 'default',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                      onMouseLeave={e => e.currentTarget.style.background =
                        !notif.read && view === 'ACTIVE' ? unreadBg : 'transparent'}>

                      {/* Icône type */}
                      <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: dark ? 'rgba(99,102,241,0.1)' : '#f3f4f6' }}>
                        <TypeIcon type={notif.type} />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>
                            {notif.title}
                          </p>
                          {!notif.read && view === 'ACTIVE' && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: textSub }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: textSub, opacity: 0.5 }}>
                          {formatDate(notif.createdAt)}
                          {view === 'ARCHIVED' && notif.archivedAt && (
                            <span className="ml-2">· archivée {formatDate(notif.archivedAt)}</span>
                          )}
                        </p>
                      </div>

                      {/* Bouton X (archiver) ou Restaurer */}
                      <div className="absolute right-3 top-3">
                        {view === 'ACTIVE' ? (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            onClick={(e) => handleArchive(e, notif.id)}
                            title="Archiver"
                            className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: textSub }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            onClick={(e) => handleRestore(e, notif.id)}
                            title="Restaurer"
                            className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="1 4 1 10 7 10"/>
                              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;