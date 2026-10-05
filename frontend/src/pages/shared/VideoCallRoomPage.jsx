import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { getBookingById, joinVideoCall, leaveVideoCall } from '../../services/videoCallService';

const JITSI_SCRIPT_URL = 'https://meet.jit.si/external_api.js';

const loadJitsiScript = () => {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const script = document.createElement('script');
    script.src = JITSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossible de charger Jitsi'));
    document.body.appendChild(script);
  });
};

const VideoCallRoomPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);

  // ÉTAPE 1 : charger le booking + le script Jitsi
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const data = await getBookingById(bookingId);
        if (cancelled) return;
        setBooking(data);
        await loadJitsiScript();
        if (cancelled) return;
        setJitsiReady(true); // déclenche le rendu du container
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            err?.response?.status === 403 || err?.response?.status === 401
              ? "Vous n'avez pas accès à cet appel."
              : "Impossible de charger l'appel. Le lien est peut-être invalide."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [bookingId]);

  // ÉTAPE 2 : monter Jitsi APRÈS que le container est rendu
  useEffect(() => {
    if (!jitsiReady || !booking || !containerRef.current || apiRef.current) return;

    const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: booking.jitsiRoom,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: user?.name || 'Utilisateur',
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#0f0a28',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'settings',
          'raisehand', 'tileview',
        ],
      },
    });

    apiRef.current = api;

    api.addEventListener('videoConferenceJoined', async () => {
      try {
        await joinVideoCall(bookingId);
      } catch (err) {
        console.error('Erreur signal join:', err);
      }
    });

    api.addEventListener('readyToClose', async () => {
      try {
        await leaveVideoCall(bookingId);
      } catch (err) {
        console.error('Erreur signal leave:', err);
      } finally {
        setCallEnded(true);
        const destination = user?.role === 'INSTRUCTOR'
          ? '/instructor/video-calls'
          : '/learner/video-calls';
        setTimeout(() => navigate(destination), 1500);
      }
    });
  }, [jitsiReady, booking]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0f0a28' }}>
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connexion à l'appel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: '#0f0a28' }}>
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fca5a5', fontSize: 20 }} />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Accès impossible</p>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 10 }} />
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (callEnded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0f0a28' }}>
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-white mb-1">Appel terminé</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ background: '#0f0a28' }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoCallRoomPage;