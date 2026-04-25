import api from './api';

export interface SessionEvent {
  userId: string;
  code: string;
  timestamp: number;
}

export interface RecordingResponse {
  roomId: string;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  events: SessionEvent[];
}

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

export interface ReportResponse {
  roomId: string;
  roomName: string;
  startedAt: string;
  endedAt: string | null;
  sessionDurationMs: number;
  isTeacher: boolean;
  analytics: ReportAnalytics;
}

const sessionService = {
  async getRecording(roomId: string): Promise<RecordingResponse> {
    const { data } = await api.get(`/sessions/${roomId}/recording`);
    return data.data as RecordingResponse;
  },

  async getReport(roomId: string): Promise<ReportResponse> {
    const { data } = await api.get(`/sessions/${roomId}/report`);
    return data.data as ReportResponse;
  },
};

export default sessionService;
