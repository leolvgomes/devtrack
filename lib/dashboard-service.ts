import type {
  Course,
  GithubApiResponse,
  GithubSnapshot,
  Project,
  Technology,
  WeeklyGoal,
} from "@/lib/dashboard-types";
import { supabase } from "@/lib/supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Configure as variaveis do Supabase para continuar.");
  }

  return supabase;
}

function ensureNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function ensureRecord<T>(data: T | null, fallbackMessage: string) {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function listTechnologies(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("technologies")
    .select("id, name, progress, hours, color")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureNoError(error);
  return data ?? [];
}

export async function createTechnology(
  userId: string,
  input: Pick<Technology, "name" | "progress" | "hours" | "color">,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("technologies")
    .insert({ user_id: userId, ...input })
    .select("id, name, progress, hours, color")
    .single();

  ensureNoError(error);
  return ensureRecord(data, "Nao foi possivel salvar a tecnologia.");
}

export async function updateTechnology(
  id: string,
  updates: Partial<Pick<Technology, "progress" | "hours">>,
) {
  const client = requireSupabase();
  const { error } = await client.from("technologies").update(updates).eq("id", id);
  ensureNoError(error);
}

export async function deleteTechnology(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("technologies").delete().eq("id", id);
  ensureNoError(error);
}

export async function listCourses(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("courses")
    .select("id, title, provider, status, progress")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureNoError(error);
  return data ?? [];
}

export async function createCourse(
  userId: string,
  input: Omit<Course, "id">,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("courses")
    .insert({ user_id: userId, ...input })
    .select("id, title, provider, status, progress")
    .single();

  ensureNoError(error);
  return ensureRecord(data, "Nao foi possivel salvar o curso.");
}

export async function updateCourse(
  id: string,
  updates: Partial<Pick<Course, "progress" | "status">>,
) {
  const client = requireSupabase();
  const { error } = await client.from("courses").update(updates).eq("id", id);
  ensureNoError(error);
}

export async function deleteCourse(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("courses").delete().eq("id", id);
  ensureNoError(error);
}

export async function listProjects(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("projects")
    .select("id, name, description, status, stack")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureNoError(error);
  return data ?? [];
}

export async function createProject(
  userId: string,
  input: Omit<Project, "id">,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("projects")
    .insert({ user_id: userId, ...input })
    .select("id, name, description, status, stack")
    .single();

  ensureNoError(error);
  return ensureRecord(data, "Nao foi possivel salvar o projeto.");
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, "status">>,
) {
  const client = requireSupabase();
  const { error } = await client.from("projects").update(updates).eq("id", id);
  ensureNoError(error);
}

export async function deleteProject(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("projects").delete().eq("id", id);
  ensureNoError(error);
}

export async function listWeeklyGoals(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("weekly_goals")
    .select("id, title, area, done")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureNoError(error);
  return data ?? [];
}

export async function createWeeklyGoal(
  userId: string,
  input: Omit<WeeklyGoal, "id">,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("weekly_goals")
    .insert({ user_id: userId, ...input })
    .select("id, title, area, done")
    .single();

  ensureNoError(error);
  return ensureRecord(data, "Nao foi possivel salvar a meta.");
}

export async function updateWeeklyGoal(
  id: string,
  updates: Pick<WeeklyGoal, "done">,
) {
  const client = requireSupabase();
  const { error } = await client.from("weekly_goals").update(updates).eq("id", id);
  ensureNoError(error);
}

export async function deleteWeeklyGoal(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("weekly_goals").delete().eq("id", id);
  ensureNoError(error);
}

type GithubSnapshotRow = {
  id: string;
  username: string;
  display_name: string;
  profile_url: string;
  repositories: number;
  pull_requests: number;
  issues_closed: number;
  commits_this_month: number;
  current_streak: number;
  weekly_commits: GithubApiResponse["weeklyCommits"];
  synced_at: string;
};

export async function getGithubSnapshot(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("github_snapshots")
    .select(
      "id, username, display_name, profile_url, repositories, pull_requests, issues_closed, commits_this_month, current_streak, weekly_commits, synced_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  ensureNoError(error);

  if (!data) {
    return null;
  }

  return mapGithubSnapshot(data as GithubSnapshotRow);
}

export async function saveGithubSnapshot(
  userId: string,
  snapshot: GithubApiResponse,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("github_snapshots")
    .upsert(
      {
        user_id: userId,
        username: snapshot.username,
        display_name: snapshot.displayName,
        profile_url: snapshot.profileUrl,
        repositories: snapshot.repositories,
        pull_requests: snapshot.pullRequests,
        issues_closed: snapshot.issuesClosed,
        commits_this_month: snapshot.commitsThisMonth,
        current_streak: snapshot.currentStreak,
        weekly_commits: snapshot.weeklyCommits,
        synced_at: snapshot.syncedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select(
      "id, username, display_name, profile_url, repositories, pull_requests, issues_closed, commits_this_month, current_streak, weekly_commits, synced_at",
    )
    .single();

  ensureNoError(error);
  return mapGithubSnapshot(
    ensureRecord(data as GithubSnapshotRow | null, "Nao foi possivel salvar o GitHub."),
  );
}

function mapGithubSnapshot(row: GithubSnapshotRow): GithubSnapshot {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    profileUrl: row.profile_url,
    repositories: row.repositories,
    pullRequests: row.pull_requests,
    issuesClosed: row.issues_closed,
    commitsThisMonth: row.commits_this_month,
    currentStreak: row.current_streak,
    weeklyCommits: row.weekly_commits,
    syncedAt: row.synced_at,
  };
}
