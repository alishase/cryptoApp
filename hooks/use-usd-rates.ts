import { useExchangeRate } from "./use-exchange-rates"; // Replace with the actual import path

// Custom hook to fetch exchange rates for multiple cryptocurrencies
export function useUSDRates(
  cryptos: string[]
): { currency: string; rate: number | undefined }[] {
  return cryptos.map((crypto) => {
    const { rate } = useExchangeRate(crypto, "USD"); // Assume useExchangeRate returns an object with `rate`
    return { currency: crypto, rate };
  });
}
