import { getOoToken, clearOoToken } from "@/lib/ooSession";

export const runtime = "nodejs";

const baseUrl = process.env.WOO_BASE_URL!;

export async function POST(req: Request) {
  try {
    const token = await getOoToken();

    if (token) {
      await fetch(`${baseUrl}/wp-json/onlineoptica/v1/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }).catch(() => {});
    }

    await clearOoToken();

    const url = new URL("/login", req.url);
    return Response.redirect(url, 303);
  } catch {
    const url = new URL("/login", req.url);
    return Response.redirect(url, 303);
  }
}
