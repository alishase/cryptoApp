"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CryptoChart from "../../components/crypto-chart-comp";
import { Search, TrendingUp, ArrowUpDown, DollarSign } from "lucide-react";
import Link from "next/link";
import useSWRForPairs from "../../hooks/use-swr-pairs";

type CryptoInfo = {
  symbol: string;
  name: string;
  price: number;
  priceChangePercent: string;
  lowPrice: string;
  highPrice: string;
  volume: string;
};
export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPair, setSelectedPair] = useState("ETHUSDT");
  const pairs = [
    "BTCUSDT",
    "TONUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "ARBUSDT",
  ];
  const results = useSWRForPairs(pairs);
  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error);
  const marketPairs = results.map((result) => result.data).filter(Boolean);

  if (!marketPairs)
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="text-blue-500">Loading cryptocurrency data</div>
        </CardContent>
      </Card>
    );
  var filteredPairs = marketPairs.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center sm:justify-between mb-6 flex-wrap md:px-8 sm:px-2 gap-5 justify-center">
        <h1 className="text-3xl font-bold">Market</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[150px]"
            />
          </div>
          <Link href="/wallet">
            <Button className="w-[140px]">
              <DollarSign className="mr-2 h-4 w-4" />
              Trade Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 col-span-3">
          <CryptoChart pair={selectedPair} />
        </div>

        <div className="space-y-6 flex flex-row justify-between items-start gap-4 md:col-span-1 col-span-3 md:block">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="gainers">Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Losers</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {filteredPairs.map((pair) => (
                      <div
                        key={pair.symbol}
                        className={`p-4 rounded-lg transition-colors cursor-pointer
                          ${
                            selectedPair === pair.symbol
                              ? "bg-primary/10"
                              : "hover:bg-secondary"
                          }
                        `}
                        onClick={() => setSelectedPair(pair.symbol)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{pair.symbol}</span>
                          <span
                            className={
                              parseFloat(pair.priceChangePercent) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {parseFloat(pair.priceChangePercent) >= 0
                              ? "+"
                              : ""}
                            {pair.priceChangePercent}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>${pair.price.toLocaleString()}</span>
                          <span>Vol ${pair.volume.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="gainers" className="mt-4">
                  <div className="space-y-4">
                    {filteredPairs
                      .filter((pair) => parseFloat(pair.priceChangePercent) > 0)
                      .sort(
                        (a, b) =>
                          parseFloat(b.priceChangePercent) -
                          parseFloat(a.priceChangePercent)
                      )
                      .map((pair) => (
                        <div
                          key={pair.symbol}
                          className={`p-4 rounded-lg transition-colors cursor-pointer
                            ${
                              selectedPair === pair.symbol
                                ? "bg-primary/10"
                                : "hover:bg-secondary"
                            }
                          `}
                          onClick={() => setSelectedPair(pair.symbol)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{pair.symbol}</span>
                            <span className="text-green-500">
                              +{pair.priceChangePercent}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>${pair.price.toLocaleString()}</span>
                            <span>Vol ${pair.volume.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="losers" className="mt-4">
                  <div className="space-y-4">
                    {filteredPairs
                      .filter((pair) => parseFloat(pair.priceChangePercent) < 0)
                      .sort(
                        (a, b) =>
                          parseFloat(a.priceChangePercent) -
                          parseFloat(b.priceChangePercent)
                      )
                      .map((pair) => (
                        <div
                          key={pair.symbol}
                          className={`p-4 rounded-lg transition-colors cursor-pointer
                            ${
                              selectedPair === pair.symbol
                                ? "bg-primary/10"
                                : "hover:bg-secondary"
                            }
                          `}
                          onClick={() => setSelectedPair(pair.symbol)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{pair.symbol}</span>
                            <span className="text-red-500">
                              {pair.priceChangePercent}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>${pair.price.toLocaleString()}</span>
                            <span>Vol ${pair.volume.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                24h Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPair && (
                <div className="space-y-4">
                  {(() => {
                    const pair = marketPairs.find(
                      (p) => p.symbol === selectedPair
                    );
                    if (!pair) return null;

                    return (
                      <>
                        <div className="flex justify-between items-center flex-wrap">
                          <span className="text-muted-foreground">
                            24h High
                          </span>
                          <span className="font-medium">
                            ${pair.highPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <span className="text-muted-foreground">24h Low</span>
                          <span className="font-medium">
                            ${pair.lowPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap">
                          <span className="text-muted-foreground">
                            24h Volume
                          </span>
                          <span className="font-medium">
                            ${pair.volume.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap">
                          <span className="text-muted-foreground">
                            24h Change
                          </span>
                          <span
                            className={`font-medium ${
                              parseFloat(pair.priceChangePercent) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {parseFloat(pair.priceChangePercent) >= 0
                              ? "+"
                              : ""}
                            {pair.priceChangePercent}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
