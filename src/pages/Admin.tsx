import { useState } from "react";
import { Lock, Loader2, Store, UtensilsCrossed, MessageCircle, Download } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, payloadError } from "@/lib/errors";

interface ClickRow {
  id: string;
  cta_type: "distributor" | "restaurant";
  variants: string[];
  page_source: string | null;
  country: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

interface FallbackRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  cta_type: string | null;
  variants: string[];
  business_name: string | null;
  city: string | null;
  message: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  distributor: number;
  restaurant: number;
  byVariant: Record<string, number>;
  bySource: Record<string, number>;
  byCountry: Record<string, number>;
}

/** Response shape returned by the admin-stats edge function. */
interface AdminPayload {
  stats: Stats;
  clicks: ClickRow[];
  fallbacks: FallbackRow[];
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminPayload | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("admin-stats", {
        body: { password },
      });
      if (fnError) throw fnError;
      const payloadErr = payloadError(res);
      if (payloadErr) throw new Error(payloadErr);
      setData(res as AdminPayload);
    } catch (err) {
      setError(errorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <SEOHead
        title="Admin Dashboard — The Nilgiri Root"
        description="Internal admin dashboard"
        noIndex
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {!data ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 text-accent mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Admin access
              </h1>
              <p className="font-body text-muted-foreground text-sm">
                Enter the shared admin password to view lead analytics.
              </p>
            </div>
            <form
              onSubmit={login}
              className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 space-y-4"
            >
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {error && <p className="text-sm font-body text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-body text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </form>
          </div>
        ) : (
          <Dashboard data={data} />
        )}
      </div>
    </main>
  );
}

function Dashboard({
  data,
}: {
  data: { stats: Stats; clicks: ClickRow[]; fallbacks: FallbackRow[] };
}) {
  const { stats, clicks, fallbacks } = data;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            WhatsApp lead analytics
          </h1>
          <p className="font-body text-muted-foreground text-sm">
            Showing the most recent 500 events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCsv("whatsapp-clicks", clicks)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:bg-muted text-foreground font-body text-xs font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export clicks CSV
          </button>
          <button
            type="button"
            onClick={() => downloadCsv("contact-fallbacks", fallbacks)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:bg-muted text-foreground font-body text-xs font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export fallbacks CSV
          </button>
        </div>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total clicks" value={stats.total} icon={<MessageCircle className="h-5 w-5" />} />
        <StatCard label="Distributor" value={stats.distributor} icon={<Store className="h-5 w-5" />} />
        <StatCard label="Restaurant" value={stats.restaurant} icon={<UtensilsCrossed className="h-5 w-5" />} />
        <StatCard label="Fallback leads" value={fallbacks.length} icon={<Lock className="h-5 w-5" />} />
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <BreakdownCard title="By variant" data={stats.byVariant} />
        <BreakdownCard title="By page source" data={stats.bySource} />
        <BreakdownCard title="By locale" data={stats.byCountry} />
      </section>

      {/* Recent clicks */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Recent clicks</h2>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="min-w-full text-sm font-body">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Variants</th>
                <th className="px-3 py-2 text-left">Source</th>
                <th className="px-3 py-2 text-left">Locale</th>
              </tr>
            </thead>
            <tbody>
              {clicks.slice(0, 50).map((c) => (
                <tr key={c.id} className="border-t border-border/40">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">{c.cta_type}</td>
                  <td className="px-3 py-2 text-foreground">{c.variants?.join(", ") || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.page_source ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.country ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fallback submissions */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Fallback contact submissions</h2>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="min-w-full text-sm font-body">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Business</th>
                <th className="px-3 py-2 text-left">City</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Variants</th>
              </tr>
            </thead>
            <tbody>
              {fallbacks.map((f) => (
                <tr key={f.id} className="border-t border-border/40">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(f.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-foreground">{f.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.phone}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.business_name ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.city ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.cta_type ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.variants?.join(", ") || "—"}</td>
                </tr>
              ))}
              {fallbacks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    No fallback submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 text-accent mb-2">{icon}</div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
      <h3 className="font-display text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data</p>
      ) : (
        <ul className="space-y-2">
          {entries.slice(0, 8).map(([k, v]) => (
            <li key={k} className="text-sm">
              <div className="flex justify-between mb-1 font-body">
                <span className="text-foreground truncate pr-2">{k}</span>
                <span className="text-muted-foreground">{v}</span>
              </div>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Generic over the row type so callers can pass their own interfaces
 * (ClickRow, FallbackRow) without those needing an index signature.
 */
function downloadCsv<T extends object>(name: string, rows: T[]) {
  if (!rows.length) {
    alert("Nothing to export yet.");
    return;
  }
  const headerSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (Array.isArray(v)) return `"${v.join("; ").replace(/"/g, '""')}"`;
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => escape((r as Record<string, unknown>)[h])).join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${name}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
