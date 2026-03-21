import { NextResponse } from "next/server";
import { getOoToken } from "@/lib/ooSession";

export const runtime = "nodejs";

const baseUrl = process.env.WOO_BASE_URL!;

export async function POST(req: Request) {
  try {
    const token = await getOoToken();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const wpRes = await fetch(`${baseUrl}/wp-json/onlineoptica/v1/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
