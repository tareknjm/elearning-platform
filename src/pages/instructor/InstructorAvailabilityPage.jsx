import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarWeek, faCheck, faFloppyDisk, faTrash,
  faCircleInfo, faLock, faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import {
  getMyAvailability,
  saveInstructorAvailability,
  getAvailabilityStatus,
} from '../../services/videoCallService';

const DAYS = [
  { key: 'MONDAY', label: 'Lundi' },
  { key: 'TUESDAY', label: 'Mardi' },
  { key: 'WEDNESDAY', label: 'Mercredi' },
  { key: 'THURSDAY', label: 'Jeudi' },
  { key: 'FRIDAY', label: 'Vendredi' },
  { key: 'SATURDAY', label: 'Samedi' },
  { key: 'SUNDAY', label: 'Dimanche' },
];

const START_HOUR = 6;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const slotKey = (day, hour) => `${day}-${hour}`;

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const InstructorAvailabilityPage = () => {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextEditDate, setNextEditDate] = useState(null);

  useEffect(() => {
    loadAll();
    const stopDrag = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDrag);
    return () => window.removeEventListener('mouseup', stopDrag);
  }, []);

  const loadAll = async () => {
    try {
      const [data, status] = await Promise.all([
        getMyAvailability(),
        getAvailabilityStatus(),
      ]);
      const initial = new Set(data.map(av => slotKey(av.dayOfWeek, av.startHour)));
      setSelected(initial);
      setCanEdit(status.canEdit);
      setLastUpdated(status.lastUpdated);
      setNextEditDate(status.nextEditDate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (day, hour, forceMode = null) => {
    if (!canEdit) return;
    const key = slotKey(day, hour);
    setSelected(prev => {
      const next = new Set(prev);
      const mode = forceMode || (next.has(key) ? 'remove' : 'add');
      if (mode === 'add') next.add(key);
      else next.delete(key);
      return next;
    });
    setSaved(false);
  };

  const handleMouseDown = (day, hour) => {
    if (!canEdit) return;
    const key = slotKey(day, hour);
    const mode = selected.has(key) ? 'remove' : 'add';
    setDragMode(mode);
    setIsDragging(true);
    toggleSlot(day, hour, mode);
  };

  const handleMouseEnter = (day, hour) => {
    if (isDragging && dragMode && canEdit) toggleSlot(day, hour, dragMode);
  };

  const clearAll = () => {
    if (!canEdit) return;
    setSelected(new Set());
    setSaved(false);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const slots = Array.from(selected).map(key => {
        const [dayOfWeek, hourStr] = key.split('-');
        return { dayOfWeek, startHour: Number(hourStr), durationMinutes: 60 };
      });
      await saveInstructorAvailability(slots);
      setSaved(true);
      setCanEdit(false);
      // Prochain lundi
      const now = new Date();
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      setNextEditDate(nextMonday.toISOString());
      setLastUpdated(new Date().toISOString());
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalHours = selected.size;

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="max-w-[1100px] mx-auto px-2 select-none">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <FontAwesomeIcon icon={faCalendarWeek} style={{ color: '#818cf8', fontSize: 18 }} />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">Mes disponibilités</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Définissez vos créneaux récurrents pour les appels 1-on-1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
              {totalHours}h / semaine
            </span>
            {totalHours > 0 && canEdit && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.18)' }}>
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 10 }} />
                Tout effacer
              </button>
            )}
          </div>
        </motion.div>

        {/* Bannière verrou si modification interdite cette semaine */}
        <AnimatePresence>
          {!canEdit && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <FontAwesomeIcon icon={faLock} style={{ color: '#fbbf24', fontSize: 13 }} />
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                  Disponibilités verrouillées jusqu'à la semaine prochaine
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Dernière modification : {formatDate(lastUpdated)} · 
                  Prochaine modification possible : {formatDate(nextEditDate)}
                </p>
              </div>
              <FontAwesomeIcon icon={faCalendarDay} style={{ color: 'rgba(245,158,11,0.5)', fontSize: 16 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info bar */}
        {canEdit && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-5"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <FontAwesomeIcon icon={faCircleInfo} style={{ color: '#818cf8', fontSize: 12 }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Cliquez ou glissez sur la grille pour sélectionner vos créneaux d'1 heure. Ces horaires se répètent chaque semaine.
            </p>
          </div>
        )}

        {/* Grille */}
        <div className="rounded-2xl overflow-hidden mb-5"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            opacity: canEdit ? 1 : 0.6,
            pointerEvents: canEdit ? 'auto' : 'none',
          }}>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 760 }}>
              <div className="grid" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
                <div className="p-2" />
                {DAYS.map(day => (
                  <div key={day.key} className="p-2.5 text-center">
                    <p className="text-xs font-bold text-white">{day.label}</p>
                  </div>
                ))}
              </div>

              {HOURS.map(hour => (
                <div key={hour} className="grid" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
                  <div className="flex items-center justify-end pr-3 py-1"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {String(hour).padStart(2, '0')}h
                    </span>
                  </div>
                  {DAYS.map(day => {
                    const key = slotKey(day.key, hour);
                    const isSelected = selected.has(key);
                    return (
                      <div key={key} className="p-0.5"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <button
                          onMouseDown={() => handleMouseDown(day.key, hour)}
                          onMouseEnter={() => handleMouseEnter(day.key, hour)}
                          className="w-full rounded-md transition-colors duration-100"
                          style={{
                            height: 22,
                            background: isSelected ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.025)',
                            border: isSelected ? '1px solid rgba(129,140,248,0.7)' : '1px solid transparent',
                            cursor: canEdit ? 'pointer' : 'not-allowed',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(99,102,241,0.55)', border: '1px solid rgba(129,140,248,0.7)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Créneau disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.025)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Non disponible</span>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex justify-end">
          {canEdit ? (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    Enregistré — verrouillé jusqu'à lundi
                  </motion.span>
                ) : saving ? (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    Enregistrement...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFloppyDisk} style={{ fontSize: 13 }} />
                    Enregistrer mes disponibilités
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <FontAwesomeIcon icon={faLock} style={{ fontSize: 13 }} />
              Modification disponible {formatDate(nextEditDate)}
            </div>
          )}
        </div>

      </div>
    </InstructorLayout>
  );
};

export default InstructorAvailabilityPage;