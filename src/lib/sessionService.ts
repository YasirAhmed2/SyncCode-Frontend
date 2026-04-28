import api from './api';

export interface UserStat {
  userId: string;
  userName: string;
  activityCount: number;
  activeTimeMs: number;
  idleTimeMs: number;
}

export interface ReportAnalytics {
  totalUsers: number;
  mostActiveUser?: string;
  leastActiveUser?: string;
  avgEngagement?: number;
  userStats: UserStat[];
}

export interface PracticeSubmission {
  studentId: string;
  studentName: string;
  code: string;
  language: 'javascript' | 'python';
  updatedAt: string;
}

export interface ReportResponse {
  roomId: string;
  roomName: string;
  startedAt: string;
  endedAt: string | null;
  sessionDurationMs: number;
  isTeacher: boolean;
  analytics: ReportAnalytics;
  practiceSubmissions?: PracticeSubmission[];
}

const sessionService = {
  async getReport(roomId: string): Promise<ReportResponse> {
    const { data } = await api.get(`/sessions/${roomId}/report`);
    return data.data as ReportResponse;
  },
};

export default sessionService;
