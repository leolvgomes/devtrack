import type { FormEvent, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

export function AuthPanel({
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

export function StatusPill({ label, done }: { label: string; done: boolean }) {
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

export function GithubMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 text-center">
      <strong className="block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

export function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
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

export function ProgressRow({
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

export function ProgressBar({
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
