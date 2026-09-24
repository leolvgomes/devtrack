import type {
  Course,
  GithubDashboardStats,
  Project,
  Technology,
  WeeklyGoal,
} from "@/lib/dashboard-types";

export function buildEvolutionData({
  courses,
  github,
  goals,
  projects,
  technologies,
}: {
  courses: Course[];
  github: GithubDashboardStats;
  goals: WeeklyGoal[];
  projects: Project[];
  technologies: Technology[];
}) {
  const techProgress = average(technologies.map((tech) => tech.progress));
  const courseProgress = average(courses.map((course) => course.progress));
  const goalCompletion = goals.length
    ? (goals.filter((goal) => goal.done).length / goals.length) * 100
    : 0;
  const publishedProjects = projects.filter(
    (project) => project.status === "Publicado",
  ).length;
  const projectScore = projects.length
    ? (publishedProjects / projects.length) * 100
    : 0;
  const githubScore = clamp(github.commitsThisMonth * 2 + github.currentStreak * 4);

  const currentScore = Math.round(
    techProgress * 0.28 +
      courseProgress * 0.24 +
      goalCompletion * 0.18 +
      projectScore * 0.16 +
      githubScore * 0.14,
  );
  const commits = github.weeklyCommits.map((item) => item.commits);
  const maxCommits = Math.max(...commits, 1);

  return github.weeklyCommits.map((item, index) => {
    const momentum = (item.commits / maxCommits) * 10;
    const distanceFromToday = github.weeklyCommits.length - 1 - index;
    const score = clamp(
      Math.round(currentScore - distanceFromToday * 3 + momentum),
    );

    return {
      score,
      week: item.day,
    };
  });
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}
