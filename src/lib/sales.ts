import { useEffect, useState } from "react";

export type Sale = {
  id: string;
  platform: "shopee" | "enjoei";
  detail: string;
  price: number;
  cost: number;
  profit: number;
  margin: number;
  date: string;
};

const KEY = "calc-vendas";

export function loadSales(): Sale[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addSale(s: Omit<Sale, "id" | "date">) {
  const all = loadSales();
  all.unshift({ ...s, id: crypto.randomUUID(), date: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function removeSale(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadSales().filter((s) => s.id !== id)));
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => setSales(loadSales()), []);
  return {
    sales,
    remove: (id: string) => {
      removeSale(id);
      setSales(loadSales());
    },
    clear: () => {
      localStorage.removeItem(KEY);
      setSales([]);
    },
  };
}
