export const SESSION_COOKIE = "jw_session";

export type PublicUser = {
  id: string;
  email: string;
};

export async function fetchMe(): Promise<PublicUser | null> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: PublicUser };
  return data.user;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ ok: true; user: PublicUser } | { ok: false; message: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return {
      ok: false,
      message:
        res.status === 401
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente de novo.",
    };
  }

  const data = (await res.json()) as { user: PublicUser };
  return { ok: true, user: data.user };
}

export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
