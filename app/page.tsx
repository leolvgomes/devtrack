"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  Database,
  Flame,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Rocket,
  Target,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import {
  AuthPanel,
  GithubMetric,
  Panel,
  ProgressBar,
  ProgressRow,
  StatusPill,
} from "@/components/dashboard-ui";
import {
  courses,
  githubStats,
  projects,
  technologies,
  weeklyGoals,
} from "@/lib/dashboard-data";
import {
  createCourse,
  createProject,
  createTechnology,
  createWeeklyGoal,
  deleteCourse,
  deleteProject,
  deleteTechnology,
  deleteWeeklyGoal,
  getGithubSnapshot,
  listCourses,
  listProjects,
  listTechnologies,
  listWeeklyGoals,
  saveGithubSnapshot,
  updateCourse,
  updateProject,
  updateTechnology,
  updateWeeklyGoal,
} from "@/lib/dashboard-service";
import type {
  Course,
  GithubApiResponse,
  GithubDashboardStats,
  Project,
  Technology,
  WeeklyGoal,
} from "@/lib/dashboard-types";
import { buildEvolutionData } from "@/lib/evolution";
import { parseStack } from "@/lib/format";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState("leolvgomes");
  const [githubData, setGithubData] =
    useState<GithubDashboardStats>(githubStats);
  const [githubProfile, setGithubProfile] = useState<GithubApiResponse | null>(
    null,
  );
  const [githubStatus, setGithubStatus] = useState(
    "Pronto para sincronizar dados publicos.",
  );
  const [isGithubPersisted, setIsGithubPersisted] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [dbTechnologies, setDbTechnologies] = useState<Technology[]>([]);
  const [techName, setTechName] = useState("");
  const [techProgress, setTechProgress] = useState(50);
  const [techHours, setTechHours] = useState(1);
  const [techMessage, setTechMessage] = useState("");
  const [isTechLoading, setIsTechLoading] = useState(false);
  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseProvider, setCourseProvider] = useState("");
  const [courseStatus, setCourseStatus] = useState("Em andamento");
  const [courseProgress, setCourseProgress] = useState(50);
  const [courseMessage, setCourseMessage] = useState("");
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("Em construcao");
  const [projectStack, setProjectStack] = useState("");
  const [projectMessage, setProjectMessage] = useState("");
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [dbWeeklyGoals, setDbWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalArea, setGoalArea] = useState("");
  const [goalMessage, setGoalMessage] = useState("");
  const [isGoalLoading, setIsGoalLoading] = useState(false);

  const displayedTechnologies: Technology[] = user
    ? dbTechnologies
    : technologies;
  const displayedCourses: Course[] = user ? dbCourses : courses;
  const displayedProjects: Project[] = user ? dbProjects : projects;
  const displayedWeeklyGoals: WeeklyGoal[] = user ? dbWeeklyGoals : weeklyGoals;
  const evolutionData = useMemo(
    () =>
      buildEvolutionData({
        courses: displayedCourses,
        github: githubData,
        goals: displayedWeeklyGoals,
        projects: displayedProjects,
        technologies: displayedTechnologies,
      }),
    [
      displayedCourses,
      displayedProjects,
      displayedTechnologies,
      displayedWeeklyGoals,
      githubData,
    ],
  );
  const currentEvolutionScore =
    evolutionData[evolutionData.length - 1]?.score ?? 0;
  const previousEvolutionScore =
    evolutionData[evolutionData.length - 2]?.score ?? currentEvolutionScore;
  const evolutionDelta = currentEvolutionScore - previousEvolutionScore;
  const githubPersistenceLabel = isGithubPersisted
    ? "Salvo no Supabase"
    : user
      ? "Aguardando primeiro salvamento"
      : "Sessao local";

  const stats = [
    {
      label: "Tecnologias",
      value: displayedTechnologies.length,
      detail: user ? "salvas no Supabase" : "exemplos locais",
      icon: Code2,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Cursos ativos",
      value: displayedCourses.filter((course) => course.status !== "Concluido")
        .length,
      detail: user ? "salvos no Supabase" : "exemplos locais",
      icon: GraduationCap,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "Projetos",
      value: displayedProjects.length,
      detail: user ? "salvos no Supabase" : "exemplos locais",
      icon: Rocket,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Commits no mes",
      value: githubData.commitsThisMonth,
      detail: `${githubData.currentStreak} dias de sequencia`,
      icon: GitBranch,
      tone: "bg-rose-100 text-rose-700",
    },
  ];

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

  useEffect(() => {
    if (user) {
      loadTechnologies(user.id);
      loadCourses(user.id);
      loadProjects(user.id);
      loadWeeklyGoals(user.id);
      loadGithubSnapshot(user.id);
    }
  }, [user]);

  async function loadTechnologies(userId: string) {
    setIsTechLoading(true);
    setTechMessage("Carregando tecnologias...");

    try {
      const data = await listTechnologies(userId);
      setDbTechnologies(data);
      setTechMessage(
        data.length
          ? "Tecnologias carregadas do Supabase."
          : "Nenhuma tecnologia cadastrada ainda.",
      );
    } catch (error) {
      setTechMessage(error instanceof Error ? error.message : "Erro ao carregar.");
    } finally {
      setIsTechLoading(false);
    }
  }

  async function loadWeeklyGoals(userId: string) {
    setIsGoalLoading(true);
    setGoalMessage("Carregando metas...");

    try {
      const data = await listWeeklyGoals(userId);
      setDbWeeklyGoals(data);
      setGoalMessage(
        data.length
          ? "Metas carregadas do Supabase."
          : "Nenhuma meta cadastrada ainda.",
      );
    } catch (error) {
      setGoalMessage(error instanceof Error ? error.message : "Erro ao carregar.");
    } finally {
      setIsGoalLoading(false);
    }
  }

  async function loadGithubSnapshot(userId: string) {
    setGithubStatus("Carregando ultimo snapshot do GitHub...");

    try {
      const snapshot = await getGithubSnapshot(userId);

      if (!snapshot) {
        setIsGithubPersisted(false);
        setGithubStatus("Nenhum snapshot salvo. Busque um usuario do GitHub.");
        return;
      }

      setGithubData(snapshot);
      setGithubProfile(snapshot);
      setGithubUsername(snapshot.username);
      setIsGithubPersisted(true);
      setGithubStatus(
        `Ultimo snapshot carregado: ${new Date(snapshot.syncedAt).toLocaleString(
          "pt-BR",
          {
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            month: "2-digit",
          },
        )}.`,
      );
    } catch (error) {
      setGithubStatus(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar o GitHub salvo.",
      );
    }
  }

  async function loadProjects(userId: string) {
    setIsProjectLoading(true);
    setProjectMessage("Carregando projetos...");

    try {
      const data = await listProjects(userId);
      setDbProjects(data);
      setProjectMessage(
        data.length
          ? "Projetos carregados do Supabase."
          : "Nenhum projeto cadastrado ainda.",
      );
    } catch (error) {
      setProjectMessage(error instanceof Error ? error.message : "Erro ao carregar.");
    } finally {
      setIsProjectLoading(false);
    }
  }

  async function loadCourses(userId: string) {
    setIsCourseLoading(true);
    setCourseMessage("Carregando cursos...");

    try {
      const data = await listCourses(userId);
      setDbCourses(data);
      setCourseMessage(
        data.length
          ? "Cursos carregados do Supabase."
          : "Nenhum curso cadastrado ainda.",
      );
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "Erro ao carregar.");
    } finally {
      setIsCourseLoading(false);
    }
  }

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
    setDbTechnologies([]);
    setDbCourses([]);
    setDbProjects([]);
    setDbWeeklyGoals([]);
    setGithubData(githubStats);
    setGithubProfile(null);
    setIsGithubPersisted(false);
    setAuthMessage("Sessao encerrada.");
  }

  async function handleGithubSync() {
    const username = githubUsername.trim();

    if (!username) {
      setGithubStatus("Informe um usuario do GitHub para sincronizar.");
      return;
    }

    setIsGithubLoading(true);
    setGithubStatus("Sincronizando com a GitHub API...");

    try {
      const response = await fetch(
        `/api/github?username=${encodeURIComponent(username)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao sincronizar GitHub.");
      }

      const githubSnapshot = data as GithubApiResponse;
      const savedSnapshot = user
        ? await saveGithubSnapshot(user.id, githubSnapshot)
        : githubSnapshot;

      setGithubData(savedSnapshot);
      setGithubProfile(savedSnapshot);
      setGithubUsername(savedSnapshot.username);
      setIsGithubPersisted(Boolean(user));
      setGithubStatus(
        `${user ? "Salvo no Supabase" : "Sincronizado"} com ${
          savedSnapshot.displayName
        } em ${new Date(
          savedSnapshot.syncedAt,
        ).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}.`,
      );
    } catch (error) {
      setGithubStatus(
        error instanceof Error
          ? error.message
          : "Nao foi possivel sincronizar com o GitHub.",
      );
    } finally {
      setIsGithubLoading(false);
    }
  }

  async function handleAddTechnology(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !user) {
      setTechMessage("Faca login para cadastrar tecnologias.");
      return;
    }

    const name = techName.trim();

    if (!name) {
      setTechMessage("Informe o nome da tecnologia.");
      return;
    }

    setIsTechLoading(true);
    setTechMessage("Salvando tecnologia...");

    try {
      const data = await createTechnology(user.id, {
        name,
        progress: techProgress,
        hours: techHours,
        color: "#0f766e",
      });

      setDbTechnologies((current) => [data, ...current]);
      setTechName("");
      setTechProgress(50);
      setTechHours(1);
      setTechMessage(`${data.name} cadastrada com sucesso.`);
    } catch (error) {
      setTechMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setIsTechLoading(false);
    }
  }

  async function handleUpdateTechnology(
    id: string | undefined,
    updates: Partial<Pick<Technology, "progress" | "hours">>,
  ) {
    if (!supabase || !id) {
      return;
    }

    setDbTechnologies((current) =>
      current.map((tech) => (tech.id === id ? { ...tech, ...updates } : tech)),
    );

    try {
      await updateTechnology(id, updates);
      setTechMessage("Tecnologia atualizada.");
    } catch (error) {
      setTechMessage(error instanceof Error ? error.message : "Erro ao atualizar.");
      if (user) {
        loadTechnologies(user.id);
      }
    }
  }

  async function handleDeleteTechnology(id: string | undefined) {
    if (!supabase || !id) {
      return;
    }

    const previous = dbTechnologies;
    setDbTechnologies((current) => current.filter((tech) => tech.id !== id));

    try {
      await deleteTechnology(id);
      setTechMessage("Tecnologia removida.");
    } catch (error) {
      setDbTechnologies(previous);
      setTechMessage(error instanceof Error ? error.message : "Erro ao remover.");
    }
  }

  async function handleAddCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !user) {
      setCourseMessage("Faca login para cadastrar cursos.");
      return;
    }

    const title = courseTitle.trim();

    if (!title) {
      setCourseMessage("Informe o nome do curso.");
      return;
    }

    setIsCourseLoading(true);
    setCourseMessage("Salvando curso...");

    try {
      const data = await createCourse(user.id, {
        title,
        provider: courseProvider.trim() || null,
        status: courseStatus,
        progress: courseProgress,
      });

      setDbCourses((current) => [data, ...current]);
      setCourseTitle("");
      setCourseProvider("");
      setCourseStatus("Em andamento");
      setCourseProgress(50);
      setCourseMessage(`${data.title} cadastrado com sucesso.`);
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setIsCourseLoading(false);
    }
  }

  async function handleUpdateCourse(
    id: string | undefined,
    updates: Partial<Pick<Course, "progress" | "status">>,
  ) {
    if (!supabase || !id) {
      return;
    }

    setDbCourses((current) =>
      current.map((course) =>
        course.id === id ? { ...course, ...updates } : course,
      ),
    );

    try {
      await updateCourse(id, updates);
      setCourseMessage("Curso atualizado.");
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "Erro ao atualizar.");
      if (user) {
        loadCourses(user.id);
      }
    }
  }

  async function handleDeleteCourse(id: string | undefined) {
    if (!supabase || !id) {
      return;
    }

    const previous = dbCourses;
    setDbCourses((current) => current.filter((course) => course.id !== id));

    try {
      await deleteCourse(id);
      setCourseMessage("Curso removido.");
    } catch (error) {
      setDbCourses(previous);
      setCourseMessage(error instanceof Error ? error.message : "Erro ao remover.");
    }
  }

  async function handleAddProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !user) {
      setProjectMessage("Faca login para cadastrar projetos.");
      return;
    }

    const name = projectName.trim();

    if (!name) {
      setProjectMessage("Informe o nome do projeto.");
      return;
    }

    setIsProjectLoading(true);
    setProjectMessage("Salvando projeto...");

    try {
      const data = await createProject(user.id, {
        name,
        description: projectDescription.trim() || null,
        status: projectStatus,
        stack: parseStack(projectStack),
      });

      setDbProjects((current) => [data, ...current]);
      setProjectName("");
      setProjectDescription("");
      setProjectStatus("Em construcao");
      setProjectStack("");
      setProjectMessage(`${data.name} cadastrado com sucesso.`);
    } catch (error) {
      setProjectMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setIsProjectLoading(false);
    }
  }

  async function handleUpdateProject(
    id: string | undefined,
    updates: Partial<Pick<Project, "status">>,
  ) {
    if (!supabase || !id) {
      return;
    }

    setDbProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, ...updates } : project,
      ),
    );

    try {
      await updateProject(id, updates);
      setProjectMessage("Projeto atualizado.");
    } catch (error) {
      setProjectMessage(error instanceof Error ? error.message : "Erro ao atualizar.");
      if (user) {
        loadProjects(user.id);
      }
    }
  }

  async function handleDeleteProject(id: string | undefined) {
    if (!supabase || !id) {
      return;
    }

    const previous = dbProjects;
    setDbProjects((current) => current.filter((project) => project.id !== id));

    try {
      await deleteProject(id);
      setProjectMessage("Projeto removido.");
    } catch (error) {
      setDbProjects(previous);
      setProjectMessage(error instanceof Error ? error.message : "Erro ao remover.");
    }
  }

  async function handleAddGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !user) {
      setGoalMessage("Faca login para cadastrar metas.");
      return;
    }

    const title = goalTitle.trim();

    if (!title) {
      setGoalMessage("Informe a meta semanal.");
      return;
    }

    setIsGoalLoading(true);
    setGoalMessage("Salvando meta...");

    try {
      const data = await createWeeklyGoal(user.id, {
        title,
        area: goalArea.trim() || null,
        done: false,
      });

      setDbWeeklyGoals((current) => [data, ...current]);
      setGoalTitle("");
      setGoalArea("");
      setGoalMessage(`${data.title} cadastrada com sucesso.`);
    } catch (error) {
      setGoalMessage(error instanceof Error ? error.message : "Erro ao salvar.");
    } finally {
      setIsGoalLoading(false);
    }
  }

  async function handleToggleGoal(id: string | undefined, done: boolean) {
    if (!supabase || !id) {
      return;
    }

    setDbWeeklyGoals((current) =>
      current.map((goal) => (goal.id === id ? { ...goal, done } : goal)),
    );

    try {
      await updateWeeklyGoal(id, { done });
      setGoalMessage(done ? "Meta concluida." : "Meta reaberta.");
    } catch (error) {
      setGoalMessage(error instanceof Error ? error.message : "Erro ao atualizar.");
      if (user) {
        loadWeeklyGoals(user.id);
      }
    }
  }

  async function handleDeleteGoal(id: string | undefined) {
    if (!supabase || !id) {
      return;
    }

    const previous = dbWeeklyGoals;
    setDbWeeklyGoals((current) => current.filter((goal) => goal.id !== id));

    try {
      await deleteWeeklyGoal(id);
      setGoalMessage("Meta removida.");
    } catch (error) {
      setDbWeeklyGoals(previous);
      setGoalMessage(error instanceof Error ? error.message : "Erro ao remover.");
    }
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
            <button
              onClick={handleGithubSync}
              disabled={isGithubLoading}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GitBranch size={16} aria-hidden="true" />
              {isGithubLoading ? "Sincronizando..." : "Sincronizar GitHub"}
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
                <StatusPill label="CRUD principal" done={Boolean(user)} />
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
                  Score calculado a partir de estudos, metas, projetos e GitHub.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
                <Flame size={15} aria-hidden="true" />
                {currentEvolutionScore} pts
                <span className="text-emerald-500">-</span>
                {evolutionDelta >= 0 ? "+" : ""}
                {evolutionDelta} pts no ciclo
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ left: -20, right: 8 }}>
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Atividade GitHub
                  </h2>
                  <p className="text-sm text-slate-500">
                    Dados publicos sincronizados pela API do GitHub.
                  </p>
                </div>
                <span
                  className={clsx(
                    "inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                    isGithubPersisted
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Database size={14} aria-hidden="true" />
                  {githubPersistenceLabel}
                </span>
              </div>
              {githubProfile ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <a
                    href={githubProfile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-700 hover:text-blue-800"
                  >
                    @{githubProfile.username}
                  </a>
                  <span className="text-slate-500">
                    Atualizado em{" "}
                    {new Date(githubProfile.syncedAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="usuario do GitHub"
              />
              <button
                onClick={handleGithubSync}
                disabled={isGithubLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GitBranch size={16} aria-hidden="true" />
                Buscar
              </button>
            </div>
            <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              {githubStatus}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <GithubMetric label="Repos" value={githubData.repositories} />
              <GithubMetric label="PRs" value={githubData.pullRequests} />
              <GithubMetric label="Issues" value={githubData.issuesClosed} />
            </div>
            <div className="mt-5 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={githubData.weeklyCommits}>
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
            {user ? (
              <form
                onSubmit={handleAddTechnology}
                className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block min-w-0 sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Tecnologia
                    </span>
                    <input
                      value={techName}
                      onChange={(event) => setTechName(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      placeholder="Ex: React"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Progresso
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={techProgress}
                      onChange={(event) =>
                        setTechProgress(Number(event.target.value))
                      }
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Horas
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={techHours}
                      onChange={(event) => setTechHours(Number(event.target.value))}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isTechLoading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Adicionar
                  </button>
                </div>
                {techMessage ? (
                  <p className="mt-3 text-sm text-slate-500">{techMessage}</p>
                ) : null}
              </form>
            ) : (
              <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                Faca login para salvar tecnologias no Supabase.
              </p>
            )}
            <div className="space-y-3">
              {displayedTechnologies.map((tech) => (
                <div
                  key={tech.id ?? tech.name}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <ProgressRow
                    label={tech.name}
                    value={tech.progress}
                    meta={`${tech.hours}h praticadas`}
                    color={tech.color}
                  />
                  {user && tech.id ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_96px_auto]">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-500">
                          Progresso
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={tech.progress}
                          onChange={(event) =>
                            handleUpdateTechnology(tech.id, {
                              progress: Number(event.target.value),
                            })
                          }
                          className="w-full accent-slate-950"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-500">
                          Horas
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={tech.hours}
                          onChange={(event) =>
                            handleUpdateTechnology(tech.id, {
                              hours: Number(event.target.value),
                            })
                          }
                          className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                      </label>
                      <button
                        onClick={() => handleDeleteTechnology(tech.id)}
                        className="flex h-9 w-9 self-end items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                        title="Remover tecnologia"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Cursos" icon={BookOpen}>
            {user ? (
              <form
                onSubmit={handleAddCourse}
                className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="grid gap-3">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Curso
                    </span>
                    <input
                      value={courseTitle}
                      onChange={(event) => setCourseTitle(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      placeholder="Ex: Next.js completo"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Plataforma
                      </span>
                      <input
                        value={courseProvider}
                        onChange={(event) =>
                          setCourseProvider(event.target.value)
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        placeholder="Ex: Alura"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Status
                      </span>
                      <select
                        value={courseStatus}
                        onChange={(event) => setCourseStatus(event.target.value)}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >
                        <option>Em andamento</option>
                        <option>Concluido</option>
                        <option>Pausado</option>
                      </select>
                    </label>
                    <label className="block min-w-0 sm:col-span-2">
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Progresso
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={courseProgress}
                        onChange={(event) =>
                          setCourseProgress(Number(event.target.value))
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isCourseLoading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Adicionar curso
                  </button>
                </div>
                {courseMessage ? (
                  <p className="mt-3 text-sm text-slate-500">
                    {courseMessage}
                  </p>
                ) : null}
              </form>
            ) : (
              <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                Faca login para salvar cursos no Supabase.
              </p>
            )}
            <div className="space-y-3">
              {displayedCourses.map((course) => (
                <div
                  key={course.id ?? course.title}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-950">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {course.provider ?? "Sem plataforma"}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {course.status}
                    </span>
                  </div>
                  <ProgressBar value={course.progress} className="mt-3" />
                  {user && course.id ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-500">
                          Progresso
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={course.progress}
                          onChange={(event) =>
                            handleUpdateCourse(course.id, {
                              progress: Number(event.target.value),
                            })
                          }
                          className="w-full accent-slate-950"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-500">
                          Status
                        </span>
                        <select
                          value={course.status}
                          onChange={(event) =>
                            handleUpdateCourse(course.id, {
                              status: event.target.value,
                            })
                          }
                          className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                          <option>Em andamento</option>
                          <option>Concluido</option>
                          <option>Pausado</option>
                        </select>
                      </label>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex h-9 w-9 self-end items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                        title="Remover curso"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Metas semanais" icon={Target}>
            {user ? (
              <form
                onSubmit={handleAddGoal}
                className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="grid gap-3">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Meta
                    </span>
                    <input
                      value={goalTitle}
                      onChange={(event) => setGoalTitle(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      placeholder="Ex: estudar 5 horas"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_144px]">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Area
                      </span>
                      <input
                        value={goalArea}
                        onChange={(event) => setGoalArea(event.target.value)}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        placeholder="Ex: GitHub"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isGoalLoading}
                      className="inline-flex h-10 w-full self-end items-center justify-center gap-2 whitespace-nowrap rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus size={16} aria-hidden="true" />
                      Adicionar
                    </button>
                  </div>
                </div>
                {goalMessage ? (
                  <p className="mt-3 text-sm text-slate-500">{goalMessage}</p>
                ) : null}
              </form>
            ) : (
              <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm text-slate-500">
                Faca login para salvar metas no Supabase.
              </p>
            )}
            <div className="space-y-3">
              {displayedWeeklyGoals.map((goal) => (
                <label
                  key={goal.id ?? goal.title}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={(event) =>
                      user && goal.id
                        ? handleToggleGoal(goal.id, event.target.checked)
                        : undefined
                    }
                    readOnly={!user || !goal.id}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-950">
                      {goal.title}
                    </span>
                    <span className="text-sm text-slate-500">
                      {goal.area ?? "Sem area"}
                    </span>
                  </span>
                  {user && goal.id ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        handleDeleteGoal(goal.id);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                      title="Remover meta"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  ) : null}
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
          </div>
          {user ? (
            <form
              onSubmit={handleAddProject}
              className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1.35fr_180px_1fr_146px]">
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    Projeto
                  </span>
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="Ex: DevTrack"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    Descricao
                  </span>
                  <input
                    value={projectDescription}
                    onChange={(event) =>
                      setProjectDescription(event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="Resumo curto do projeto"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    Status
                  </span>
                  <select
                    value={projectStatus}
                    onChange={(event) => setProjectStatus(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option>Em construcao</option>
                    <option>Publicado</option>
                    <option>Pausado</option>
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-500">
                    Stack
                  </span>
                  <input
                    value={projectStack}
                    onChange={(event) => setProjectStack(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    placeholder="Next.js, Supabase"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isProjectLoading}
                  className="inline-flex h-10 w-full self-end items-center justify-center gap-2 whitespace-nowrap rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 xl:col-span-1"
                >
                  <Plus size={16} aria-hidden="true" />
                  Adicionar
                </button>
              </div>
              {projectMessage ? (
                <p className="mt-3 text-sm text-slate-500">{projectMessage}</p>
              ) : null}
            </form>
          ) : (
            <p className="mb-5 rounded-md bg-slate-50 p-3 text-sm text-slate-500">
              Faca login para salvar projetos no Supabase.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {displayedProjects.map((project) => (
              <article
                key={project.id ?? project.name}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.description ?? "Sem descricao"}
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
                {user && project.id ? (
                  <div className="mt-4 flex items-end gap-3">
                    <label className="block flex-1">
                      <span className="mb-1 block text-xs font-medium text-slate-500">
                        Status
                      </span>
                      <select
                        value={project.status}
                        onChange={(event) =>
                          handleUpdateProject(project.id, {
                            status: event.target.value,
                          })
                        }
                        className="h-9 w-full rounded-md border border-slate-200 px-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >
                        <option>Em construcao</option>
                        <option>Publicado</option>
                        <option>Pausado</option>
                      </select>
                    </label>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                      title="Remover projeto"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
