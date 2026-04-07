import { NextRequest, NextResponse } from "next/server";
import { speedyPost } from "@/lib/speedy";

export const runtime = "nodejs";

type SpeedyOffice = {
  id: number;
  name: string;
  address?: {
    fullAddressString?: string;
    siteAddressString?: string;
    localAddressString?: string;
  };
};

type SpeedyOfficesResponse = {
  offices?: SpeedyOffice[];
};

export async function GET(req: NextRequest) {
  try {
    const siteIdRaw = req.nextUrl.searchParams.get("siteId");
    const siteId = Number(siteIdRaw);

    if (!siteId || !Number.isFinite(siteId)) {
      return NextResponse.json({ offices: [] });
    }

    const data = await speedyPost<{ siteId: number }, SpeedyOfficesResponse>(
      "/location/office",
      { siteId }
    );

    return NextResponse.json({
      offices: data.offices || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
