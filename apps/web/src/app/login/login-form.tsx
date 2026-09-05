"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginRequest } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await loginRequest(email, password);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="login-stage-delay flex w-full max-w-[var(--content-max)] flex-col gap-[var(--space-4)]"
      noValidate
    >
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="email" className="text-[var(--text-sm)] text-[var(--muted)]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]"
        />
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        <label
          htmlFor="password"
          className="text-[var(--text-sm)] text-[var(--muted)]"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="text-[var(--text-sm)] text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-[var(--space-2)] rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-base)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
