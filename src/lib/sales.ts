import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Platform = "shopee" | "enjoei" | "doces";
export type Sale = {
  id: string;
  platform: Platform;
  detail: string;
  name?: string;
  qty?: number;
  price: number;
  cost: number;
  profit: number;
  margin: number;
  date: string;
};

const KEY = "calc-vendas";
export const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function loadLocal(): Sale[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter((s): s is Sale => Boolean(s && typeof s === "object" && typeof s.id === "string" && ["shopee", "enjoei", "doces"].includes(s.platform) && typeof s.price === "number" && typeof s.cost === "number" && typeof s.profit === "number" && typeof s.margin === "number" && typeof s.date === "string")) : [];
  } catch {
    return [];
  }
}
function toSale(row: Tables<"sales">): Sale {
  return { id: row.id, platform: row.platform as Platform, detail: row.detail, name: row.name, qty: row.qty, price: Number(row.price), cost: Number(row.cost), profit: Number(row.profit), margin: Number(row.margin), date: row.date };
}

async function importLocal(userId: string) {
  const pending = loadLocal();
  if (!pending.length) return;
  // Stable IDs make retries safe if a network response is lost after a successful write.
  for (const sale of pending) {
    const { error } = await supabase.from("sales").upsert({
      id: sale.id, user_id: userId, platform: sale.platform, detail: sale.detail || "",
      name: sale.name || "", qty: sale.qty || 1, price: sale.price, cost: sale.cost,
      profit: sale.profit, margin: sale.margin, date: sale.date.slice(0, 10),
    }, { onConflict: "id" });
    if (error) throw error;
    // Remove only successfully imported records, keeping anything saved in another tab.
    localStorage.setItem(KEY, JSON.stringify(loadLocal().filter((item) => item.id !== sale.id)));
  }
}

export async function addSale(s: Omit<Sale, "id">): Promise<"saved" | "needsAuth"> {
  const sale = { ...s, id: crypto.randomUUID() };
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    localStorage.setItem(KEY, JSON.stringify([sale, ...loadLocal()]));
    return "needsAuth";
  }
  const { error } = await supabase.from("sales").insert({
    id: sale.id, user_id: user.id, platform: sale.platform, detail: sale.detail,
    name: sale.name || "", qty: sale.qty || 1, price: sale.price, cost: sale.cost,
    profit: sale.profit, margin: sale.margin, date: sale.date.slice(0, 10),
  });
  if (error) throw error;
  return "saved";
}

export function formatDate(d: string) {
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setSignedIn(Boolean(user));
      if (!user) {
        setSales(loadLocal());
        return;
      }
      await importLocal(user.id);
      const { data, error: readError } = await supabase.from("sales").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (readError) throw readError;
      setSales((data || []).map(toSale));
    } catch {
      setError("Não foi possível carregar suas vendas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => void refresh(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  const update = async (id: string, patch: Partial<Sale>) => {
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        localStorage.setItem(KEY, JSON.stringify(loadLocal().map(s => s.id === id ? { ...s, ...patch } : s)));
      } else {
        const changes = { ...(patch.name !== undefined ? { name: patch.name } : {}), ...(patch.date !== undefined ? { date: patch.date } : {}) };
        const { error: e } = await supabase.from("sales").update(changes).eq("id", id).eq("user_id", user.id);
        if (e) throw e;
      }
      await refresh();
    } catch { setError("Não foi possível editar a venda."); }
  };
  const remove = async (id: string) => {
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) localStorage.setItem(KEY, JSON.stringify(loadLocal().filter(s => s.id !== id)));
      else {
        const { error: e } = await supabase.from("sales").delete().eq("id", id).eq("user_id", user.id);
        if (e) throw e;
      }
      await refresh();
    } catch { setError("Não foi possível apagar a venda."); }
  };
  const clear = async () => {
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) localStorage.removeItem(KEY);
      else {
        const { error: e } = await supabase.from("sales").delete().eq("user_id", user.id);
        if (e) throw e;
      }
      await refresh();
    } catch { setError("Não foi possível apagar as vendas."); }
  };
  return { sales, loading, error, signedIn, refresh, update, remove, clear };
}
