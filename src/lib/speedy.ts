export type SpeedyAuthPayload = {
  userName: string;
  password: string;
  language: "BG" | "EN";
};

const SPEEDY_BASE_URL = process.env.SPEEDY_BASE_URL || "https://api.speedy.bg/v1";

function getAuth(): SpeedyAuthPayload {
  const userName = process.env.SPEEDY_USERNAME;
  const password = process.env.SPEEDY_PASSWORD;

  if (!userName || !password) {
    throw new Error("Missing SPEEDY_USERNAME or SPEEDY_PASSWORD");
  }

  return {
    userName,
    password,
    language: "BG",
  };
}

export async function speedyPost<TReq extends object, TRes>(
  path: string,
  payload: TReq
): Promise<TRes> {
  const res = await fetch(`${SPEEDY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...getAuth(),
      ...payload,
    }),
    cache: "no-store",
  });

  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Speedy returned invalid JSON: ${text}`);
  }

  if (!res.ok) {
    throw new Error(`Speedy HTTP ${res.status}: ${JSON.stringify(data)}`);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Speedy API error");
  }

  return data as TRes;
}
