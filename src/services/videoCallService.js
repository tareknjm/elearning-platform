import api from './api';

// ════════════════════════════════════════
// INSTRUCTEUR — Disponibilités
// ════════════════════════════════════════

/**
 * Sauvegarde les disponibilités hebdomadaires de l'instructeur connecté.
 * Remplace entièrement les anciennes disponibilités (delete + recreate côté backend).
 * @param {Array<{dayOfWeek: string, startHour: number, durationMinutes: number}>} slots
 */
export const saveInstructorAvailability = async (slots) => {
  const response = await api.post('/instructor/availability', slots);
  return response.data;
};

/**
 * Récupère les disponibilités actuelles de l'instructeur connecté.
 */
export const getMyAvailability = async () => {
  const response = await api.get('/instructor/availability');
  return response.data;
};

// ════════════════════════════════════════
// INSTRUCTEUR — Appels vidéo & absences
// ════════════════════════════════════════

/**
 * Liste tous les appels vidéo (passés/futurs) de l'instructeur connecté.
 */
export const getInstructorVideoCalls = async () => {
  const response = await api.get('/instructor/video-calls');
  return response.data;
};

/**
 * Soumet un certificat médical justifiant une absence à un appel.
 * @param {number} bookingId
 * @param {File} file
 * @param {string} reason
 */
export const submitAbsenceJustification = async (bookingId, file, reason) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('reason', reason);

  const response = await api.post(`/instructor/absences/${bookingId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ════════════════════════════════════════
// LEARNER — Réservation d'appels
// ════════════════════════════════════════

/**
 * Récupère les créneaux disponibles d'un instructeur pour un cours donné.
 * @param {number} instructorId
 * @param {number} courseId
 */
export const getAvailableSlots = async (instructorId, courseId) => {
  const response = await api.get(`/learner/video-calls/slots/${instructorId}/${courseId}`);
  return response.data;
};

/**
 * Réserve un appel vidéo 1-on-1.
 * @param {{courseId: number, instructorId: number, scheduledAt: string, durationMinutes: number}} payload
 */
export const bookVideoCall = async (payload) => {
  const response = await api.post('/learner/video-calls/book', payload);
  return response.data;
};

/**
 * Liste tous les appels vidéo (passés/futurs) du learner connecté.
 */
export const getMyVideoCalls = async () => {
  const response = await api.get('/learner/video-calls');
  return response.data;
};

// ════════════════════════════════════════
// ADMIN — Justificatifs & amendes
// ════════════════════════════════════════

/**
 * Liste les justificatifs médicaux en attente de validation.
 */
export const getPendingJustifications = async () => {
  const response = await api.get('/admin/absences');
  return response.data;
};

/**
 * Approuve ou rejette un justificatif médical.
 * @param {number} justificationId
 * @param {'APPROVE'|'REJECT'} decision
 * @param {string} adminNote
 */
export const reviewJustification = async (justificationId, decision, adminNote) => {
  const response = await api.post(`/admin/absences/${justificationId}/review`, {
    decision,
    adminNote,
  });
  return response.data;
};

/**
 * Liste les amendes en attente.
 */
export const getPendingPenalties = async () => {
  const response = await api.get('/admin/penalties');
  return response.data;
};
// ════════════════════════════════════════
// COMMUN — Salle d'appel (Jitsi)
// ════════════════════════════════════════

/**
 * Récupère un booking précis (learner ou instructeur du booking uniquement).
 * @param {number} bookingId
 */
export const getBookingById = async (bookingId) => {
  const response = await api.get(`/video-calls/${bookingId}`);
  return response.data;
};

/**
 * Signale que l'utilisateur connecté a rejoint l'appel Jitsi.
 * @param {number} bookingId
 */
export const joinVideoCall = async (bookingId) => {
  const response = await api.post(`/video-calls/${bookingId}/join`);
  return response.data;
};

/**
 * Signale que l'utilisateur connecté a quitté l'appel Jitsi.
 * Le backend décide si le booking passe à COMPLETED ou ABSENT.
 * @param {number} bookingId
 */
export const leaveVideoCall = async (bookingId) => {
  const response = await api.post(`/video-calls/${bookingId}/leave`);
  return response.data;
};

export const getAllJustifications = async () => {
  const response = await api.get('/admin/absences/all');
  return response.data;
};
export const getAvailabilityStatus = async () => {
  const response = await api.get('/instructor/availability/status');
  return response.data;
};