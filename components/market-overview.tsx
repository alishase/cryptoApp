"use client";

import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

// Types
type CryptoInfo = {
  symbol: string;
  name: string;
  price: number;
  change24h: string;
  volume: string;
};

type BinanceResponse = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
};

// Helper function to format volume
const formatVolume = (volumeInThousands: number): string => {
  const volume = volumeInThousands * 1000;
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
};

// Fetcher function for SWR
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
    change24h: `${data.priceChangePercent}%`,
    volume: formatVolume(parseFloat(data.volume)),
  };
};

// Individual crypto card component
const CryptoCard = ({ crypto }: { crypto: CryptoInfo }) => (
  <Card className="overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{crypto.symbol}</span>
          <span className="text-sm text-muted-foreground">{crypto.name}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold">${crypto.price}</div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center ${
              parseFloat(crypto.change24h) >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {parseFloat(crypto.change24h) >= 0 ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            <span className="font-medium">
              {Math.abs(parseFloat(crypto.change24h))}%
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Vol: {crypto.volume}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function MarketOverview() {
  const pairs = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

  // Fetch data for all pairs using SWR
  const results = pairs.map((pair) =>
    useSWR(pair, fetcher, {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    })
  );

  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error);

  if (error) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="text-red-500">Error loading cryptocurrency data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Market Overview</CardTitle>
        <CardDescription>Real-time cryptocurrency market data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            results.map(
              ({ data }) =>
                data && <CryptoCard key={data.symbol} crypto={data} />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
