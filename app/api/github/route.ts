import { NextRequest, NextResponse } from "next/server";

type GitHubEvent = {
  type: string;
  created_at: string;
  payload?: {
    commits?: unknown[];
  };
};

type GitHubUser = {
  html_url: string;
  login: string;
  name: string | null;
  public_repos: number;
};

type SearchResponse = {
  total_count: number;
};

const dayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get("username")?.trim() ||
    process.env.NEXT_PUBLIC_GITHUB_USERNAME ||
    "leolvgomes";

  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return NextResponse.json(
      { error: "Usuario do GitHub invalido." },
      { status: 400 },
    );
  }

  try {
    const [profile, events, pullRequests, closedIssues] = await Promise.all([
      githubFetch<GitHubUser>(`/users/${username}`),
      githubFetch<GitHubEvent[]>(`/users/${username}/events/public?per_page=100`),
      githubFetch<SearchResponse>(
        `/search/issues?q=author:${username}+type:pr&per_page=1`,
      ),
      githubFetch<SearchResponse>(
        `/search/issues?q=author:${username}+type:issue+is:closed&per_page=1`,
      ),
    ]);

    const commitEvents = events.filter((event) => event.type === "PushEvent");
    const commitsThisMonth = countCommitsSince(commitEvents, startOfMonth());
    const weeklyCommits = buildWeeklyCommits(commitEvents);

    return NextResponse.json({
      username: profile.login,
      displayName: profile.name ?? profile.login,
      profileUrl: profile.html_url,
      repositories: profile.public_repos,
      pullRequests: pullRequests.total_count,
      issuesClosed: closedIssues.total_count,
      commitsThisMonth,
      currentStreak: calculateCurrentStreak(commitEvents),
      weeklyCommits,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel sincronizar com o GitHub.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Usuario do GitHub nao encontrado.");
    }

    if (response.status === 403) {
      throw new Error(
        "Limite da GitHub API atingido. Configure GITHUB_TOKEN no .env.local.",
      );
    }

    throw new Error(`GitHub API respondeu com status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function countCommitsSince(events: GitHubEvent[], since: Date) {
  return events.reduce((total, event) => {
    if (new Date(event.created_at) < since) {
      return total;
    }

    return total + (event.payload?.commits?.length ?? 0);
  }, 0);
}

function buildWeeklyCommits(events: GitHubEvent[]) {
  const today = stripTime(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      day: titleCase(dayFormatter.format(date).replace(".", "")),
      commits: 0,
    };
  });

  events.forEach((event) => {
    const eventDate = stripTime(new Date(event.created_at));
    const day = days.find((item) => item.date.getTime() === eventDate.getTime());

    if (day) {
      day.commits += event.payload?.commits?.length ?? 0;
    }
  });

  return days.map(({ day, commits }) => ({ day, commits }));
}

function calculateCurrentStreak(events: GitHubEvent[]) {
  const commitDays = new Set(
    events
      .filter((event) => (event.payload?.commits?.length ?? 0) > 0)
      .map((event) => stripTime(new Date(event.created_at)).toISOString()),
  );

  let streak = 0;
  const cursor = stripTime(new Date());

  while (commitDays.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
