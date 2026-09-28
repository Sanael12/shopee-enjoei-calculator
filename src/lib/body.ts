export const MEASURES = [
  { key: "pescoco", label: "Pescoço", short: "Pesc" },
  { key: "ombros", label: "Ombros", short: "Omb" },
  { key: "peitoral", label: "Peitoral", short: "Peit" },
  { key: "bracoD", label: "Braço D", short: "Br D" },
  { key: "bracoE", label: "Braço E", short: "Br E" },
  { key: "antebracoD", label: "Antebraço D", short: "Ant D" },
  { key: "antebracoE", label: "Antebraço E", short: "Ant E" },
  { key: "abdomen", label: "Abdômen", short: "Abd" },
  { key: "cintura", label: "Cintura", short: "Cint" },
  { key: "quadril", label: "Quadril", short: "Quad" },
  { key: "coxaD", label: "Coxa D", short: "Cx D" },
  { key: "coxaE", label: "Coxa E", short: "Cx E" },
  { key: "panturrilhaD", label: "Panturrilha D", short: "Pt D" },
  { key: "panturrilhaE", label: "Panturrilha E", short: "Pt E" },
] as const;

export type MeasureKey = (typeof MEASURES)[number]["key"];

export const FOLDS = [
  { key: "peitoral", label: "Peitoral" },
  { key: "axilar", label: "Axilar média" },
  { key: "triceps", label: "Tríceps" },
  { key: "subescapular", label: "Subescapular" },
  { key: "abdominal", label: "Abdominal" },
  { key: "suprailiaca", label: "Supra-ilíaca" },
  { key: "coxa", label: "Coxa" },
] as const;

export type FoldKey = (typeof FOLDS)[number]["key"];

export type Assessment = {
  id: string;
  date: string;
  age: number;
  height: number;
  weight: number;
  measures: Partial<Record<MeasureKey, number>>;
  folds: Partial<Record<FoldKey, number>>;
  wrist?: number | undefined;
  femur?: number | undefined;
};

export type Composition = {
  bmi: number;
  fatPct: number;
  fatKg: number;
  musclePct: number;
  muscleKg: number;
  bonePct: number;
  boneKg: number;
  residualPct: number;
  residualKg: number;
  fatMethod: string;
  boneMethod: string;
};

const RESIDUAL_RATIO_MALE = 0.241;

export function parseNum(value: string | number | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function siri(density: number) {
  return 495 / density - 450;
}

function fatPercent(a: Assessment): { pct: number; method: string } {
  const f = a.folds;
  const all7 = FOLDS.every((fold) => f[fold.key]);
  if (all7) {
    const s = FOLDS.reduce((sum, fold) => sum + (f[fold.key] ?? 0), 0);
    const d = 1.112 - 0.00043499 * s + 0.00000055 * s * s - 0.00028826 * a.age;
    return { pct: siri(d), method: "Dobras cutâneas — Jackson & Pollock 7 dobras (ajustado pela idade)" };
  }
  if (f.peitoral && f.abdominal && f.coxa) {
    const s = f.peitoral + f.abdominal + f.coxa;
    const d = 1.10938 - 0.0008267 * s + 0.0000016 * s * s - 0.0002574 * a.age;
    return { pct: siri(d), method: "Dobras cutâneas — Jackson & Pollock 3 dobras (ajustado pela idade)" };
  }
  const bmi = a.weight / (a.height / 100) ** 2;
  const deurenberg = 1.2 * bmi + 0.23 * a.age - 16.2;
  const { abdomen, pescoco } = a.measures;
  if (abdomen && pescoco && abdomen > pescoco) {
    const navy = 495 / (1.0324 - 0.19077 * Math.log10(abdomen - pescoco) + 0.15456 * Math.log10(a.height)) - 450;
    return {
      pct: (navy + deurenberg) / 2,
      method: "Circunferências (Marinha EUA) combinado com IMC e idade (Deurenberg)",
    };
  }
  return { pct: deurenberg, method: "Estimativa por IMC e idade (Deurenberg) — adicione pescoço, abdômen ou dobras" };
}

function boneMass(a: Assessment): { kg: number; method: string } {
  const h = a.height / 100;
  const measured = Boolean(a.wrist && a.femur);
  const wrist = (a.wrist ?? 5.8 * (a.height / 175)) / 100;
  const femur = (a.femur ?? 9.7 * (a.height / 175)) / 100;
  const kg = 3.02 * (h * h * wrist * femur * 400) ** 0.712;
  return {
    kg,
    method: measured
      ? "Von Döbeln/Rocha com diâmetros de punho e fêmur"
      : "Von Döbeln/Rocha com diâmetros estimados pela altura",
  };
}

export function computeComposition(a: Assessment): Composition | null {
  if (!a.weight || !a.height || !a.age) return null;
  const fat = fatPercent(a);
  const fatPct = Math.min(Math.max(fat.pct, 3), 60);
  const fatKg = (a.weight * fatPct) / 100;
  const bone = boneMass(a);
  const residualKg = a.weight * RESIDUAL_RATIO_MALE;
  const muscleKg = Math.max(a.weight - fatKg - bone.kg - residualKg, 0);
  const pct = (kg: number) => (kg / a.weight) * 100;
  return {
    bmi: a.weight / (a.height / 100) ** 2,
    fatPct,
    fatKg,
    musclePct: pct(muscleKg),
    muscleKg,
    bonePct: pct(bone.kg),
    boneKg: bone.kg,
    residualPct: RESIDUAL_RATIO_MALE * 100,
    residualKg,
    fatMethod: fat.method,
    boneMethod: bone.method,
  };
}

export type Goal = "emagrecer" | "ganhar";
export type Trend = "good" | "bad" | "same";

export function measureTrend(prev: number | undefined, curr: number | undefined, goal: Goal): Trend {
  if (prev === undefined || curr === undefined) return "same";
  const diff = Math.round((curr - prev) * 10) / 10;
  if (diff === 0) return "same";
  const increased = diff > 0;
  return (goal === "ganhar") === increased ? "good" : "bad";
}

export function fmt(n: number | undefined, digits = 1) {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function formatDateBR(d: string) {
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
