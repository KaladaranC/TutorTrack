import { Session, SessionStatus } from '../types';

const STORAGE_KEY = 'tutor_track_sessions_v1';

export const getSessions = (): Session[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load sessions', error);
    return [];
  }
};

export const saveSession = (session: Session): Session[] => {
  const sessions = getSessions();
  const newSessions = [...sessions, session];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  return newSessions;
};

export const updateSession = (updatedSession: Session): Session[] => {
  const sessions = getSessions();
  const newSessions = sessions.map(s => s.id === updatedSession.id ? updatedSession : s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  return newSessions;
};

export const deleteSession = (id: string): Session[] => {
  const sessions = getSessions();
  const newSessions = sessions.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  return newSessions;
};

// Seed data if empty (for demo purposes)
export const seedDataIfEmpty = () => {
  const sessions = getSessions();
  // Seed disabled for production use - start empty
  return sessions;
};
