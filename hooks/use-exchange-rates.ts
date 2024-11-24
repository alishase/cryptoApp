"use client";

import useSWR from "swr";
import { getExchangeRate } from "@/lib/binance";

export function useExchangeRate(fromCurrency: string, toCurrency: string) {
  const { data, error, isLoading } = useSWR(
    [`exchange-rate-${fromCurrency}-${toCurrency}`, fromCurrency, toCurrency],
    ([_, from, to]) => getExchangeRate(from, to),
    { refreshInterval: 10000 }
  );
  const rate = data || 0;

  return { rate, data, error, isLoading };
}
