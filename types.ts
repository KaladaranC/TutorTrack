export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID'
}

export interface Session {
  id: string;
  studentName: string;
  subject: string;
  startTime: string; // ISO String
  durationMinutes: number;
  rate: number;
  status: SessionStatus;
  notes?: string;
  createdAt: number;
}

export interface Stats {
  totalEarnings: number;
  pendingPayment: number;
  totalSessions: number;
  upcomingSessions: number;
}

// AI Parsing Response Type
export interface ParsedSchedule {
  studentName: string;
  subject: string;
  startTime: string;
  durationMinutes: number;
  rate: number;
}
