import { NextResponse } from "next/server";

export const runtime = "nodejs";

const baseUrl = process.env.WOO_BASE_URL!;

export async function POST(req: Request) {
  try {
    const { login, key, password } = (await req.json()) as {
      login?: string;
      key?: string;
      password?: string;
    };

    if (!login || !key || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const wpRes = await fetch(`${baseUrl}/wp-json/onlineoptica/v1/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, key, password }),
      cache: "no-store",
    });

    const text = await wpRes.text();

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: "invalid_wp_response", raw: text };
    }

    return NextResponse.json(data, { status: wpRes.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }
}
