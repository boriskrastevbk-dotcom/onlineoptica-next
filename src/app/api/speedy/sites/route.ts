import { NextRequest, NextResponse } from "next/server";
import { speedyPost } from "@/lib/speedy";

export const runtime = "nodejs";

type SpeedySite = {
  id: number;
  name: string;
  postCode?: string;
  municipality?: string;
  region?: string;
};

type SpeedySitesResponse = {
  sites?: SpeedySite[];
};

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("query")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ sites: [] });
    }

    const data = await speedyPost<
      { name: string; countryId: number },
      SpeedySitesResponse
    >("/location/site", {
      name: query,
      countryId: 100,
    });

    return NextResponse.json({
      sites: (data.sites || []).slice(0, 20),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
