export interface IDashboardOverview {
  canViewSystemMetrics: boolean;
  summary: {
    userCount: number;
    roleCount: number;
    departmentCount: number;
    publishedNoticeCount: number;
    todayLoginCount: number;
  } | null;
  loginTrend: Array<{ date: string; count: number }>;
  recentNotices: Array<{
    id: string;
    title: string;
    type: "notice" | "announcement";
    publishAt: string | null;
    readAt: string | null;
  }>;
  recentLogins: Array<{
    id: string;
    username: string | null;
    loginIp: string | null;
    browser: string | null;
    os: string | null;
    loginAt: string;
  }>;
}
