import { NextResponse } from "next/server";
import { runQuery } from "@/lib/snowflake";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await runQuery<{ CATEGORY: string; TOTAL_QTY: number }>(
      "SELECT category AS CATEGORY, SUM(qty) AS TOTAL_QTY FROM amazon_sales_raw WHERE courier_status = 'Shipped' GROUP BY category ORDER BY total_qty DESC"
    );
    return NextResponse.json({ items: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
