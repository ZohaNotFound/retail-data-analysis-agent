"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#4f9dde", "#e07a5f", "#81b29a", "#f2cc8f", "#9b5de5", "#f15bb5"];

type StockSummary = {
  total_products: number;
  low_stock_count: number;
  low_stock_items: { ASIN: string; REMAINING: number; THRESHOLD: number }[];
};
type WorstPerformers = { items: { ASIN: string; REMAINING: number }[] };
type SalesByCategory = { items: { CATEGORY: string; TOTAL_QTY: number }[] };

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  return res.json();
}

export default function DashboardClient() {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [worst, setWorst] = useState<WorstPerformers | null>(null);
  const [sales, setSales] = useState<SalesByCategory | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  async function refresh() {
    const [s, w, c] = await Promise.all([
      fetchJSON<StockSummary>("/api/stock-summary"),
      fetchJSON<WorstPerformers>("/api/worst-performers"),
      fetchJSON<SalesByCategory>("/api/sales-by-category"),
    ]);
    setSummary(s);
    setWorst(w);
    setSales(c);
    setLastUpdated(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Retail Stock Dashboard</h1>
        <span style={{ color: "#888", fontSize: "0.85rem" }}>
          Last updated {lastUpdated} · auto-refreshes every 30s
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", margin: "1.5rem 0" }}>
        <StatCard label="Total products tracked" value={summary?.total_products ?? "..."} />
        <StatCard label="Below threshold" value={summary?.low_stock_count ?? "..."} highlight={!!summary?.low_stock_count} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <ChartCard title="Lowest stock (top 10)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={worst?.items ?? []} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" stroke="#888" />
              <YAxis type="category" dataKey="ASIN" stroke="#888" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1f2b", border: "none" }} />
              <Bar dataKey="REMAINING" fill="#4f9dde" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales by category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sales?.items ?? []}
                dataKey="TOTAL_QTY"
                nameKey="CATEGORY"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.CATEGORY}
              >
                {(sales?.items ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1f2b", border: "none" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {summary && summary.low_stock_count > 0 && (
        <div style={{ marginTop: "1.5rem", background: "#1a1f2b", borderRadius: 12, padding: "1rem 1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>Low stock items</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#888" }}>
                <th>ASIN</th><th>Remaining</th><th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {summary.low_stock_items.slice(0, 20).map((item) => (
                <tr key={item.ASIN}>
                  <td>{item.ASIN}</td>
                  <td>{item.REMAINING}</td>
                  <td>{item.THRESHOLD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div style={{ background: "#1a1f2b", borderRadius: 12, padding: "1.2rem 1.5rem" }}>
      <div style={{ color: "#888", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 600, color: highlight ? "#e07a5f" : "#e6e6e6" }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a1f2b", borderRadius: 12, padding: "1.2rem" }}>
      <h3 style={{ marginTop: 0, fontSize: "1rem", color: "#ccc" }}>{title}</h3>
      {children}
    </div>
  );
}
