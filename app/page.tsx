"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Code2,
  Flame,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Rocket,
  Target,
} from "lucide-react";
import { clsx } from "clsx";
import {
  courses,
  evolution,
  githubStats,
  projects,
  technologies,
  weeklyGoals,
} from "@/lib/dashboard-data";
import { supabase } from "@/lib/supabase";

const stats = [
  {
    label: "Tecnologias",
    value: technologies.length,
    detail: "4 em progresso",
    icon: Code2,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Cursos ativos",
    value: courses.filter((course) => course.status !== "Concluido").length,
    detail: "2 quase finalizando",
    icon: GraduationCap,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    label: "Projetos",
    value: projects.length,
    detail: "1 pronto para deploy",
    icon: Rocket,
    tone: "bg-amber-100 text-amber-700",
  },
  {
    label: "Commits no mes",
    value: githubStats.commitsThisMonth,
    detail: `${githubStats.currentStreak} dias de sequencia`,
    icon: GitBranch,
    tone: "bg-rose-100 text-rose-700",
  },
];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setAuthMessage("Configure as variaveis do Supabase para autenticar.");
      return;
    }

    setIsAuthLoading(true);
    setAuthMessage("");

    const response =
      authMode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsAuthLoading(false);

    if (response.error) {
      setAuthMessage(response.error.message);
      return;
    }

    setAuthMessage(
      authMode === "signin"
        ? "Login realizado com sucesso."
        : "Cadastro criado. Se a confirmacao por e-mail estiver ativa, confirme sua conta antes de entrar.",
    );
    setPassword("");
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setAuthMessage("Sessao encerrada.");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
              <LayoutDashboard size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                DevTrack Dashboard
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                Evolucao profissional
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <GitBranch size={16} aria-hidden="true" />
              Sincronizar GitHub
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <Plus size={16} aria-hidden="true" />
              Nova meta
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <AuthPanel
            authMessage={authMessage}
            authMode={authMode}
            email={email}
            isAuthLoading={isAuthLoading}
            password={password}
            user={user}
            onAuth={handleAuth}
            onEmailChange={setEmail}
            onModeChange={setAuthMode}
            onPasswordChange={setPassword}
            onSignOut={handleSignOut}
          />

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Status do backend
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A conexao com Supabase ja esta configurada. O proximo passo e
                  criar as tabelas e trocar estes dados mockados por consultas.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatusPill label="Supabase" done={Boolean(supabase)} />
                <StatusPill label="Auth" done={Boolean(user)} />
                <StatusPill label="CRUD" done={false} />
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <strong className="mt-2 block text-3xl font-semibold text-slate-950">
                    {stat.value}
                  </strong>
                </div>
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-md",
                    stat.tone,
                  )}
                >
                  <stat.icon size={20} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Grafico de evolucao
                </h2>
                <p className="text-sm text-slate-500">
                  Pontuacao semanal combinando estudo, pratica e entregas.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
                <Flame size={15} aria-hidden="true" />
                +18% no ciclo
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolution} margin={{ left: -20, right: 8 }}>
                  <defs>
                    <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#0f766e"
                    strokeWidth={3}
                    fill="url(#score)"
                    name="Evolucao"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Atividade GitHub
              </h2>
              <p className="text-sm text-slate-500">
                Resumo preparado para receber dados da GitHub API.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <GithubMetric label="Repos" value={githubStats.repositories} />
              <GithubMetric label="PRs" value={githubStats.pullRequests} />
              <GithubMetric label="Issues" value={githubStats.issuesClosed} />
            </div>
            <div className="mt-5 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={githubStats.weeklyCommits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  />
                  <Bar
                    dataKey="commits"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    name="Commits"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel title="Tecnologias aprendidas" icon={Code2}>
            <div className="space-y-3">
              {technologies.map((tech) => (
                <ProgressRow
                  key={tech.name}
                  label={tech.name}
                  value={tech.progress}
                  meta={`${tech.hours}h praticadas`}
                  color={tech.color}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Cursos" icon={BookOpen}>
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.title}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-950">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {course.provider}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {course.status}
                    </span>
                  </div>
                  <ProgressBar value={course.progress} className="mt-3" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Metas semanais" icon={Target}>
            <div className="space-y-3">
              {weeklyGoals.map((goal) => (
                <label
                  key={goal.title}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    defaultChecked={goal.done}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                  />
                  <span>
                    <span className="block font-medium text-slate-950">
                      {goal.title}
                    </span>
                    <span className="text-sm text-slate-500">{goal.area}</span>
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Projetos em andamento
              </h2>
              <p className="text-sm text-slate-500">
                CRUD, API, deploy e portfolio em um so lugar.
              </p>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              title="Adicionar projeto"
            >
              <Plus size={17} aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.name}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.description}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      project.status === "Publicado"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthPanel({
  authMessage,
  authMode,
  email,
  isAuthLoading,
  password,
  user,
  onAuth,
  onEmailChange,
  onModeChange,
  onPasswordChange,
  onSignOut,
}: {
  authMessage: string;
  authMode: "signin" | "signup";
  email: string;
  isAuthLoading: boolean;
  password: string;
  user: User | null;
  onAuth: (event: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (email: string) => void;
  onModeChange: (mode: "signin" | "signup") => void;
  onPasswordChange: (password: string) => void;
  onSignOut: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Autenticacao</h2>
        <p className="text-sm text-slate-500">
          Login e cadastro por e-mail usando Supabase Auth.
        </p>
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
            Logado como <strong>{user.email}</strong>
          </div>
          <button
            onClick={onSignOut}
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sair da conta
          </button>
        </div>
      ) : (
        <form onSubmit={onAuth} className="space-y-3">
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onModeChange("signin")}
              className={clsx(
                "h-9 rounded px-3 text-sm font-medium transition",
                authMode === "signin"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className={clsx(
                "h-9 rounded px-3 text-sm font-medium transition",
                authMode === "signup"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Criar conta
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="voce@email.com"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
              minLength={6}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              placeholder="minimo 6 caracteres"
            />
          </label>
          <button
            type="submit"
            disabled={isAuthLoading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAuthLoading
              ? "Conectando..."
              : authMode === "signin"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>
      )}

      {authMessage ? (
        <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          {authMessage}
        </p>
      ) : null}
    </article>
  );
}

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-md border p-3 text-sm font-medium",
        done
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500",
      )}
    >
      {label}: {done ? "ok" : "pendente"}
    </div>
  );
}

function GithubMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 text-center">
      <strong className="block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Code2;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </article>
  );
}

function ProgressRow({
  label,
  value,
  meta,
  color,
}: {
  label: string;
  value: number;
  meta: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-medium text-slate-950">{label}</span>
        <span className="text-sm text-slate-500">{meta}</span>
      </div>
      <ProgressBar value={value} color={color} />
    </div>
  );
}

function ProgressBar({
  value,
  color = "#0f766e",
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={clsx("h-2 rounded-full bg-slate-100", className)}>
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}
