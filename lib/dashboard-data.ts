export const technologies = [
  { name: "Next.js", progress: 78, hours: 42, color: "#0f766e" },
  { name: "TypeScript", progress: 71, hours: 36, color: "#2563eb" },
  { name: "Supabase", progress: 48, hours: 18, color: "#16a34a" },
  { name: "Tailwind CSS", progress: 84, hours: 28, color: "#0891b2" },
  { name: "GitHub API", progress: 39, hours: 12, color: "#7c3aed" },
];

export const courses = [
  {
    title: "Next.js App Router",
    provider: "Rocketseat",
    status: "Em andamento",
    progress: 72,
  },
  {
    title: "TypeScript do zero",
    provider: "Alura",
    status: "Concluido",
    progress: 100,
  },
  {
    title: "Supabase para SaaS",
    provider: "Udemy",
    status: "Em andamento",
    progress: 44,
  },
];

export const projects = [
  {
    name: "DevTrack",
    description: "Dashboard full stack para acompanhar estudos e entregas.",
    status: "Em construcao",
    stack: ["Next.js", "Supabase", "Recharts"],
  },
  {
    name: "TaskFlow",
    description: "Kanban pessoal com CRUD, filtros e autenticacao.",
    status: "Publicado",
    stack: ["React", "Firebase", "Tailwind"],
  },
  {
    name: "GitPulse",
    description: "Resumo de atividade usando a GitHub API.",
    status: "Em construcao",
    stack: ["API", "Node", "Charts"],
  },
];

export const weeklyGoals = [
  { title: "Concluir modulo de auth", area: "Supabase", done: true },
  { title: "Criar CRUD de tecnologias", area: "Banco de dados", done: false },
  { title: "Publicar deploy na Vercel", area: "Deploy", done: false },
  { title: "Registrar 5 dias de commits", area: "GitHub", done: true },
];

export const evolution = [
  { week: "S1", score: 34 },
  { week: "S2", score: 41 },
  { week: "S3", score: 46 },
  { week: "S4", score: 53 },
  { week: "S5", score: 61 },
  { week: "S6", score: 66 },
  { week: "S7", score: 73 },
  { week: "S8", score: 81 },
];

export const githubStats = {
  commitsThisMonth: 86,
  currentStreak: 6,
  repositories: 12,
  pullRequests: 9,
  issuesClosed: 18,
  weeklyCommits: [
    { day: "Seg", commits: 8 },
    { day: "Ter", commits: 12 },
    { day: "Qua", commits: 7 },
    { day: "Qui", commits: 16 },
    { day: "Sex", commits: 11 },
    { day: "Sab", commits: 5 },
    { day: "Dom", commits: 9 },
  ],
};
