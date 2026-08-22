export type FinancialRecordSnapshot = Record<string, unknown>;

export type FinanceSnapshot = {
  currency: string | null;
  hasMultipleCurrencies: boolean;
  netPosition: number | null;
  income: number | null;
  expenses: number | null;
  liabilities: number | null;
  recordCount: number;
};

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function summarizeFinanceRecords(records: FinancialRecordSnapshot[]): FinanceSnapshot {
  const currencies = new Set(records.map((record) => typeof record.currency === "string" ? record.currency : "").filter(Boolean));
  const hasMultipleCurrencies = currencies.size > 1;
  const currency = currencies.size === 1 ? [...currencies][0] : null;
  if (hasMultipleCurrencies) return { currency: null, hasMultipleCurrencies: true, netPosition: null, income: null, expenses: null, liabilities: null, recordCount: records.length };

  const summary = records.reduce<FinanceSnapshot>((summary, record) => {
    const amount = numberValue(record.amount);
    if (record.kind === "income") summary.income = (summary.income ?? 0) + amount;
    if (record.kind === "expense") summary.expenses = (summary.expenses ?? 0) + amount;
    if (record.kind === "liability") summary.liabilities = (summary.liabilities ?? 0) + amount;
    return summary;
  }, { currency, hasMultipleCurrencies: false, netPosition: 0, income: 0, expenses: 0, liabilities: 0, recordCount: records.length });
  summary.netPosition = (summary.income ?? 0) - (summary.expenses ?? 0) - (summary.liabilities ?? 0);
  return summary;
}
