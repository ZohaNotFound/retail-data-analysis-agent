import { NextResponse } from "next/server";
import { runQuery } from "@/lib/snowflake";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await runQuery<{ ASIN: string; REMAINING: number }>(
      "SELECT asin AS ASIN, remaining AS REMAINING FROM product_stock ORDER BY remaining ASC LIMIT 10"
    );
    return NextResponse.json({ items: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
