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
  if (sessions.length === 0) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const seed: Session[] = [
      {
        id: '1',
        studentName: 'Alice Johnson',
        subject: 'Math',
        startTime: yesterday.toISOString(),
        durationMinutes: 60,
        rate: 50,
        status: SessionStatus.PAID,
        createdAt: Date.now(),
        notes: 'Covered Algebra basics'
      },
      {
        id: '2',
        studentName: 'Bob Smith',
        subject: 'Physics',
        startTime: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        durationMinutes: 90,
        rate: 75,
        status: SessionStatus.COMPLETED, // Finished but not paid
        createdAt: Date.now(),
        notes: 'Newton laws'
      },
      {
        id: '3',
        studentName: 'Charlie Brown',
        subject: 'Chemistry',
        startTime: tomorrow.toISOString(),
        durationMinutes: 60,
        rate: 60,
        status: SessionStatus.SCHEDULED,
        createdAt: Date.now()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return sessions;
};
