import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Json } from "@/integrations/supabase/types";
import type { Assessment } from "@/lib/body";

const LOCAL_KEY = "calc-avaliacoes";
const METADATA_KEY = "calc_body_assessments";

function isAssessment(value: unknown): value is Assessment {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<Assessment>;
  return (
    typeof a.id === "string" &&
    typeof a.date === "string" &&
    typeof a.weight === "number" &&
    typeof a.height === "number" &&
    typeof a.age === "number"
  );
}

function loadLocal(): Assessment[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(value) ? value.filter(isAssessment) : [];
  } catch {
    return [];
  }
}

function saveLocal(list: Assessment[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

function loadMetadata(user: User): Assessment[] {
  const value: unknown = user.user_metadata?.[METADATA_KEY];
  return Array.isArray(value) ? value.filter(isAssessment) : [];
}

async function saveMetadata(list: Assessment[]) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { error } = await supabase.auth.updateUser({ data: { [METADATA_KEY]: list } });
  if (error) throw error;
}

function isMissingTable(error: { code?: string; message?: string } | null | undefined) {
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    Boolean(error?.message?.includes("schema cache"))
  );
}

function sortByDate(list: Assessment[]) {
  return [...new Map(list.map((a) => [a.id, a])).values()].sort((a, b) =>
    a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date),
  );
}

async function currentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

function toPayload(a: Assessment): Json {
  const { id: _id, date: _date, ...rest } = a;
  return rest as unknown as Json;
}

async function fetchAll(user: User | null): Promise<Assessment[]> {
  if (!supabase || !user) return sortByDate(loadLocal());
  const { data, error } = await supabase
    .from("body_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return sortByDate([...loadMetadata(user), ...loadLocal()]);
    throw error;
  }
  return sortByDate(
    (data || []).map((row) => ({
      ...(row.data as unknown as Omit<Assessment, "id" | "date">),
      id: row.id,
      date: row.date,
    })),
  );
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await currentUser();
      setSignedIn(Boolean(user));
      setAssessments(await fetchAll(user));
    } catch {
      setError("Não foi possível carregar suas avaliações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => void refresh(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const remove = async (id: string) => {
    setError("");
    try {
      const user = await currentUser();
      saveLocal(loadLocal().filter((a) => a.id !== id));
      if (supabase && user) {
        const { error: e } = await supabase
          .from("body_assessments")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (e && !isMissingTable(e)) throw e;
        const meta = loadMetadata(user);
        if (meta.some((a) => a.id === id)) await saveMetadata(meta.filter((a) => a.id !== id));
      }
      setAssessments((list) => list.filter((a) => a.id !== id));
    } catch {
      setError("Não foi possível apagar a avaliação.");
    }
  };

  return { assessments, loading, error, signedIn, refresh, remove };
}

export async function saveAssessment(a: Omit<Assessment, "id">): Promise<"saved" | "local"> {
  const assessment: Assessment = { ...a, id: crypto.randomUUID() };
  const user = await currentUser();
  if (!supabase || !user) {
    saveLocal([...loadLocal(), assessment]);
    return "local";
  }
  const { error } = await supabase.from("body_assessments").insert({
    id: assessment.id,
    user_id: user.id,
    date: assessment.date,
    data: toPayload(assessment),
  });
  if (error) {
    if (!isMissingTable(error)) throw error;
    await saveMetadata([...loadMetadata(user), assessment]);
  }
  return "saved";
}
