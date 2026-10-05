import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEuroSign, faCircleCheck, faTriangleExclamation,
  faCalendarDays, faUser,
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getPendingPenalties } from '../../services/videoCallService';

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  PAID:    { label: 'Payée',      color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  WAIVED:  { label: 'Annulée',    color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
};

const AdminPenaltiesPage = () => {
  const { dark } = useTheme();
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub     = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg      = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const accentLight = '#a5b4fc';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPendingPenalties();
      setPenalties(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = penalties
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accentLight }}>
            Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: textPrimary, letterSpacing: '-0.02em' }}>
            Amendes instructeurs
          </h1>
          <p className="text-sm mt-1" style={{ color: textSub }}>
            Amendes émises suite aux absences non justifiées.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total amendes', value: penalties.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: faTriangleExclamation },
            { label: 'En attente', value: penalties.filter(p => p.status === 'PENDING').length, color: '#fca5a5', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: faEuroSign },
            { label: 'Montant total', value: `${totalAmount.toFixed(0)}€`, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: faCircleCheck },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color, fontSize: 13 }} />
                <p className="text-xs font-semibold" style={{ color: stat.color }}>{stat.label}</p>
              </div>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
          </div>
        ) : penalties.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#10b981', fontSize: 32 }} className="mb-3" />
            <p className="font-semibold text-sm" style={{ color: textPrimary }}>Aucune amende en attente</p>
            <p className="text-xs mt-1" style={{ color: textSub }}>Tous les instructeurs ont été présents.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {penalties.map((penalty, i) => {
              const statusCfg = STATUS_CONFIG[penalty.status] || STATUS_CONFIG.PENDING;
              return (
                <motion.div key={penalty.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                      <FontAwesomeIcon icon={faEuroSign} style={{ color: statusCfg.color, fontSize: 14 }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold" style={{ color: textPrimary }}>
                          {penalty.instructor?.name}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: textSub }}>
                        {penalty.booking?.course?.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                          <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 9 }} />
                          {formatDateTime(penalty.issuedAt)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                          <FontAwesomeIcon icon={faUser} style={{ fontSize: 9 }} />
                          {penalty.reason}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color: statusCfg.color }}>
                        {penalty.amount?.toFixed(0)}€
                      </p>
                      <p className="text-[10px]" style={{ color: textSub }}>amende</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPenaltiesPage;