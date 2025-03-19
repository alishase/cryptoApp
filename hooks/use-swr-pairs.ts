import useSWR, { SWRResponse } from "swr";

type CryptoInfo = {
  symbol: string;
  name: string;
  price: number;
  priceChangePercent: string;
  lowPrice: number;
  highPrice: number;
  volume: string;
};

type BinanceResponse = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  lowPrice: string;
  highPrice: string;
};

const formatVolume = (volumeInThousands: number): string => {
  const volume = volumeInThousands * 1000;
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
};

const fetcher = async (pair: string): Promise<CryptoInfo> => {
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.toUpperCase()}`
  );

  if (!response.ok) {
    throw new Error(`Error fetching data for pair ${pair}`);
  }

  const data: BinanceResponse = await response.json();

  return {
    symbol: data.symbol,
    name: pair.toUpperCase(),
    price: parseFloat(data.lastPrice),
    priceChangePercent: `${data.priceChangePercent}%`,
    lowPrice: parseFloat(data.lowPrice),
    highPrice: parseFloat(data.highPrice),
    volume: formatVolume(parseFloat(data.volume)),
  };
};
export default function useSWRForPairs(
  pairs: string[]
): SWRResponse<any, any>[] {
  return pairs.map((pair) =>
    useSWR(pair, fetcher, {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    })
  );
}
