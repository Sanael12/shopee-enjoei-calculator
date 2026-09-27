import { useEffect, useState } from "react";

export type Platform = "shopee" | "enjoei" | "doces";

export type Sale = {
  id: string;
  platform: Platform;
  detail: string;
  name?: string;
  qty?: number;
  price: number; // total (já multiplicado pela quantidade)
  cost: number;
  profit: number;
  margin: number;
  date: string; // yyyy-mm-dd
};

const KEY = "calc-vendas";

export const today = () => new Date().toISOString().slice(0, 10);

export function loadSales(): Sale[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(all: Sale[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function addSale(s: Omit<Sale, "id">) {
  const all = loadSales();
  all.unshift({ ...s, id: crypto.randomUUID() });
  save(all);
}

export function formatDate(d: string) {
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => setSales(loadSales()), []);
  return {
    sales,
    update: (id: string, patch: Partial<Sale>) => {
      save(loadSales().map((s) => (s.id === id ? { ...s, ...patch } : s)));
      setSales(loadSales());
    },
    remove: (id: string) => {
      save(loadSales().filter((s) => s.id !== id));
      setSales(loadSales());
    },
    clear: () => {
      localStorage.removeItem(KEY);
      setSales([]);
    },
  };
}
