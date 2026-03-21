import { cookies } from "next/headers";

const COOKIE_NAME = "oo_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export async function setOoToken(token: string) {
  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getOoToken() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function clearOoToken() {
  const store = await cookies();

  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
