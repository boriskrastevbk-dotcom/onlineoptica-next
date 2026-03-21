import { NextResponse } from "next/server";
import { getOoToken } from "@/lib/ooSession";

export const runtime = "nodejs";

const baseUrl = process.env.WOO_BASE_URL!;


export async function GET(req: Request) {
  try {
    const token = await getOoToken();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const qs = url.searchParams.toString();
    const wpUrl = `${baseUrl}/wp-json/onlineoptica/v1/orders${qs ? `?${qs}` : ""}`;

    const wpRes = await fetch(wpUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
