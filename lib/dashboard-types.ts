import { githubStats } from "@/lib/dashboard-data";

export type GithubDashboardStats = typeof githubStats;

export type GithubApiResponse = GithubDashboardStats & {
  displayName: string;
  profileUrl: string;
  syncedAt: string;
  username: string;
};

export type GithubSnapshot = GithubApiResponse & {
  id?: string;
};

export type Technology = {
  id?: string;
  name: string;
  progress: number;
  hours: number;
  color: string;
};

export type Course = {
  id?: string;
  title: string;
  provider: string | null;
  status: string;
  progress: number;
};

export type Project = {
  id?: string;
  name: string;
  description: string | null;
  status: string;
  stack: string[];
};

export type WeeklyGoal = {
  id?: string;
  title: string;
  area: string | null;
  done: boolean;
};
