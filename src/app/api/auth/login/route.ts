import { NextResponse } from "next/server";
import { setOoToken } from "@/lib/ooSession";

export const runtime = "nodejs";

const baseUrl = process.env.WOO_BASE_URL!;


export async function POST(req: Request) {
  try {
    const { login, password } = (await req.json()) as {
      login?: string;
      password?: string;
    };

    if (!login || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_credentials" },
        { status: 400 }
      );
    }

    const wpRes = await fetch(`${baseUrl}/wp-json/onlineoptica/v1/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
      cache: "no-store",
    });

    const text = await wpRes.text();

    let data: any = {};
    try {
     
data = JSON.parse(text);
    } catch {
      data = {
        ok: false,
        error: "invalid_wp_response",
        raw: text,
      };
    }

    if (!wpRes.ok || !data?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || "login_failed",
          details: data?.raw || text || null,
        },
        { status: wpRes.status || 500 }
      );
    }

    if (!data?.token) {
      return NextResponse.json(
        { ok: false, error: "missing_token", details: data },
        { status: 502 }
      );
    }

    await setOoToken(data.token);

    return NextResponse.json({
      ok: true,
      user: data.user ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", details: e?.message || null },
      { status: 500 }
    );
  }
}
