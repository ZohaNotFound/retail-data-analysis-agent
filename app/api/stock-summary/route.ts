import { NextResponse } from "next/server";
import { runQuery } from "@/lib/snowflake";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalRows = await runQuery<{ TOTAL: number }>(
      "SELECT COUNT(*) AS TOTAL FROM product_stock"
    );
    const lowStock = await runQuery<{ ASIN: string; REMAINING: number; THRESHOLD: number }>(
      "SELECT asin AS ASIN, remaining AS REMAINING, threshold AS THRESHOLD FROM product_stock WHERE remaining < threshold ORDER BY remaining ASC"
    );

    return NextResponse.json({
      total_products: totalRows[0]?.TOTAL ?? 0,
      low_stock_count: lowStock.length,
      low_stock_items: lowStock,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
