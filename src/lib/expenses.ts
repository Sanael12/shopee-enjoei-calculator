import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";

export type Expense = {
  id: string;
  name: string;
  qty: number;
  amount: number;
  is_negative: boolean;
  date: string;
};

const KEY = "calc-gastos";
const METADATA_KEY = "calc_expenses";

export const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function loadLocal(): Expense[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(isExpense) : [];
  } catch {
    return [];
  }
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<Expense>;
  return (
    typeof e.id === "string" &&
    typeof e.name === "string" &&
    typeof e.qty === "number" &&
    typeof e.amount === "number" &&
    typeof e.is_negative === "boolean" &&
    typeof e.date === "string"
  );
}

function loadMetadata(user: User): Expense[] {
  const value: unknown = user.user_metadata?.[METADATA_KEY];
  return Array.isArray(value) ? value.filter(isExpense) : [];
}

function isMissingExpensesTable(error: { code?: string } | null | undefined) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

async function saveMetadata(user: User, expenses: Expense[]) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.updateUser({
    data: { [METADATA_KEY]: expenses },
  });
  if (error) throw error;
}

function toExpense(row: Tables<"expenses">): Expense {
  return {
    id: row.id,
    name: row.name,
    qty: row.qty,
    amount: Number(row.amount),
    is_negative: row.is_negative,
    date: row.date,
  };
}

async function importPending(user: User) {
  if (!supabase) return;
  const pending = [...loadLocal(), ...loadMetadata(user)];
  if (!pending.length) return;
  const unique = [...new Map(pending.map((exp) => [exp.id, exp])).values()];
  for (const exp of unique) {
    const { error } = await supabase.from("expenses").upsert(
      {
        id: exp.id,
        user_id: user.id,
        name: exp.name,
        qty: exp.qty,
        amount: exp.amount,
        is_negative: exp.is_negative,
        date: exp.date.slice(0, 10),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  }
  localStorage.removeItem(KEY);
  await saveMetadata(user, []);
}

export async function addExpense(
  e: Omit<Expense, "id">,
): Promise<"saved" | "needsAuth"> {
  const expense = { ...e, id: crypto.randomUUID() };
  const { data: { user }, error: authError } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };
  if (!supabase || authError || !user) {
    localStorage.setItem(KEY, JSON.stringify([expense, ...loadLocal()]));
    return "needsAuth";
  }
  const { error } = await supabase.from("expenses").insert({
    id: expense.id,
    user_id: user.id,
    name: expense.name,
    qty: expense.qty,
    amount: expense.amount,
    is_negative: expense.is_negative,
    date: expense.date.slice(0, 10),
  });
  if (error) {
    if (isMissingExpensesTable(error)) {
      await saveMetadata(user, [expense, ...loadMetadata(user)]);
      return "saved";
    }
    throw error;
  }
  return "saved";
}

export function formatDate(d: string) {
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      setSignedIn(Boolean(user));
      if (!supabase || !user) {
        setExpenses(loadLocal());
        return;
      }
      const firstRead = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (firstRead.error && isMissingExpensesTable(firstRead.error)) {
        setExpenses([...loadMetadata(user), ...loadLocal()]);
        return;
      }
      if (firstRead.error) throw firstRead.error;
      await importPending(user);
      const { data, error: readError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (readError) throw readError;
      setExpenses((data || []).map(toExpense));
    } catch {
      setError("Não foi possível carregar seus gastos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT")
          setTimeout(() => void refresh(), 0);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  const update = async (id: string, patch: Partial<Expense>) => {
    setError("");
    try {
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      if (!supabase || !user) {
        localStorage.setItem(
          KEY,
          JSON.stringify(loadLocal().map((e) => (e.id === id ? { ...e, ...patch } : e))),
        );
      } else {
        const changes: { name?: string; date?: string; is_negative?: boolean } = {};
        if (patch.name !== undefined) changes.name = patch.name;
        if (patch.date !== undefined) changes.date = patch.date;
        if (patch.is_negative !== undefined) changes.is_negative = patch.is_negative;
        const { error: e } = await supabase
          .from("expenses")
          .update(changes)
          .eq("id", id)
          .eq("user_id", user.id);
        if (e) {
          if (isMissingExpensesTable(e)) {
            await saveMetadata(user, loadMetadata(user).map((expense) => (
              expense.id === id ? { ...expense, ...patch } : expense
            )));
          } else {
            throw e;
          }
        }
      }
      await refresh();
    } catch {
      setError("Não foi possível editar o gasto.");
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      if (!supabase || !user)
        localStorage.setItem(KEY, JSON.stringify(loadLocal().filter((e) => e.id !== id)));
      else {
        const { error: e } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (e) {
          if (isMissingExpensesTable(e)) {
            await saveMetadata(user, loadMetadata(user).filter((expense) => expense.id !== id));
          } else {
            throw e;
          }
        }
      }
      await refresh();
    } catch {
      setError("Não foi possível apagar o gasto.");
    }
  };

  const clear = async () => {
    setError("");
    try {
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      if (!supabase || !user) localStorage.removeItem(KEY);
      else {
        const { error: e } = await supabase
          .from("expenses")
          .delete()
          .eq("user_id", user.id);
        if (e) {
          if (isMissingExpensesTable(e)) {
            await saveMetadata(user, []);
          } else {
            throw e;
          }
        }
      }
      await refresh();
    } catch {
      setError("Não foi possível apagar os gastos.");
    }
  };

  return { expenses, loading, error, signedIn, refresh, update, remove, clear };
}
