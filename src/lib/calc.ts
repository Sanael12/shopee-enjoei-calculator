export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function parseMoney(v: string): number {
  const cleaned = v.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export type Line = { label: string; value: number };

export type Result = {
  lines: Line[];
  received: number;
  profit: number;
  margin: number;
};

type ShopeeTier = {
  label: string;
  rate: number;
  fixed: number;
  pix: number;
  pixLabel: string;
};

export function shopeeTier(price: number): ShopeeTier {
  if (price < 80)
    return { label: "Até R$79,99", rate: 0.2, fixed: 4.5, pix: 0, pixLabel: "–" };
  if (price < 100)
    return { label: "R$80 a R$99,99", rate: 0.14, fixed: 16, pix: 0.05, pixLabel: "5%" };
  if (price < 200)
    return { label: "R$100 a R$199,99", rate: 0.14, fixed: 20, pix: 0.05, pixLabel: "5%" };
  if (price < 500)
    return { label: "R$200 a R$499,99", rate: 0.14, fixed: 26, pix: 0.05, pixLabel: "5%" };
  return { label: "Acima de R$500", rate: 0.14, fixed: 26, pix: 0.08, pixLabel: "até 8%" };
}

export const SELLER_FEE = 3;
export const EMBALAGEM = 1;
export const ENVIO_PROTEGIDO = 2.5;

export type Level = "loss" | "bad" | "mid" | "good";
export function profitLevel(profit: number, margin: number): Level {
  if (profit < 0) return "loss";
  if (margin < 20) return "bad";
  if (margin <= 45) return "mid";
  return "good";
}
export const LEVEL_STYLE: Record<Level, { cls: string; label: string }> = {
  loss: { cls: "bg-[var(--loss)] text-[var(--loss-foreground)]", label: "prejuízo" },
  bad: { cls: "bg-destructive text-destructive-foreground", label: "ruim" },
  mid: { cls: "bg-[var(--warn)] text-[var(--warn-foreground)]", label: "médio" },
  good: { cls: "bg-[var(--gain)] text-[var(--gain-foreground)]", label: "bom" },
};

export function calcShopee(price: number, cost: number, applyPix: boolean): Result {
  const tier = shopeeTier(price);
  const commission = price * tier.rate;
  const pix = applyPix ? price * tier.pix : 0;
  const lines: Line[] = [
    { label: "Valor da venda", value: price },
    { label: `Comissão (${(tier.rate * 100).toFixed(0)}%)`, value: -commission },
    { label: "Tarifa fixa", value: -tier.fixed },
    { label: "Taxa vendedor CPF", value: -SELLER_FEE },
  ];
  if (applyPix) lines.push({ label: `Subsídio Pix (${tier.pixLabel})`, value: -pix });
  const received = price - commission - tier.fixed - SELLER_FEE - pix;
  lines.push({ label: "Embalagem", value: -EMBALAGEM });
  lines.push({ label: "Custo do produto", value: -cost });
  const profit = received - EMBALAGEM - cost;
  return { lines, received, profit, margin: price > 0 ? (profit / price) * 100 : 0 };
}

export type EnjoeiMode = "gratis" | "classico" | "turbinado";

export const ENJOEI_MODES: Record<
  EnjoeiMode,
  { name: string; rate: number; fixed: number; desc: string }
> = {
  gratis: { name: "Modo grátis", rate: 0, fixed: 0, desc: "Comissão 0% e tarifa R$ 0" },
  classico: { name: "Modo clássico", rate: 0.12, fixed: 12.5, desc: "Comissão 12% + tarifa fixa" },
  turbinado: { name: "Modo turbinado", rate: 0.18, fixed: 12.5, desc: "Comissão 18% + tarifa fixa" },
};

export function calcEnjoei(mode: EnjoeiMode, price: number, cost: number): Result {
  const m = ENJOEI_MODES[mode];
  const commission = price * m.rate;
  const received = price - commission - m.fixed - ENVIO_PROTEGIDO;
  const lines: Line[] = [
    { label: "Valor da venda", value: price },
    { label: `Comissão (${(m.rate * 100).toFixed(0)}%)`, value: -commission },
    { label: "Tarifa fixa", value: -m.fixed },
    { label: "Envio protegido", value: -ENVIO_PROTEGIDO },
    { label: "Embalagem", value: -EMBALAGEM },
    { label: "Custo do produto", value: -cost },
  ];
  const profit = received - EMBALAGEM - cost;
  return { lines, received, profit, margin: price > 0 ? (profit / price) * 100 : 0 };
}
