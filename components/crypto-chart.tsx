"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as Chart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type ChartData = { time: string; price: number }[];

export function CryptoChart() {
  const [timeframe, setTimeframe] = useState("7D");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ChartData>([]);

  const getBTCUSDTHistoricalPrices = async (days: number) => {
    setIsLoading(true);
    const timestamps: { [key: number]: number } = {
      7: Date.now() - 7 * 24 * 60 * 60 * 1000,
      14: Date.now() - 14 * 24 * 60 * 60 * 1000,
      30: Date.now() - 30 * 24 * 60 * 60 * 1000,
    };

    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${timestamps[days]}&limit=${days}`
      );

      if (!response.ok) {
        throw new Error("Ошибка получения данных");
      }

      const res = await response.json();

      const chartData: ChartData = res.map((candle: any, index: number) => ({
        time: `Day ${index + 1}`,
        price: parseFloat(candle[4]),
      }));

      setData(chartData);
      setIsLoading(false);
      return chartData;
    } catch (error) {
      console.error("Ошибка:", error);
      setIsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    // Initial data load
    getBTCUSDTHistoricalPrices(7);
  }, []);

  const handleTimeframeChange = (days: number, label: string) => {
    setTimeframe(label);
    getBTCUSDTHistoricalPrices(days);
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">BTC/USD Price Chart</CardTitle>
          <div className="flex gap-2">
            {[
              { label: "7D", days: 7 },
              { label: "14D", days: 14 },
              { label: "30D", days: 30 },
            ].map((tf) => (
              <Button
                key={tf.label}
                variant={timeframe === tf.label ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange(tf.days, tf.label)}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <Chart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="price"
                  stroke={
                    data[0].price > data[data.length - 1].price
                      ? "#ff2c2c"
                      : "#5ce65c"
                  }
                  strokeWidth={3}
                  dot={false}
                />
              </Chart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
