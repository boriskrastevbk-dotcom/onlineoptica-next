import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    WOO_BASE_URL: process.env.WOO_BASE_URL ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
  });
}
