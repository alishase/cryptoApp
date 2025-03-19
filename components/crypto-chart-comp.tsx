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

interface CryptoChartProps {
  pair: string; // Trading pair like 'BTCUSDT'
}
type ChartData = { time: string; price: number }[];

const CryptoChart: React.FC<CryptoChartProps> = ({ pair }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [interval, setInterval] = useState("1h");
  const [limit, setLimit] = useState(24);
  const [timeframe, setTimeframe] = useState("24H");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`
        );

        const data = await response.json();

        const chartData: ChartData = data.map((candle: any, index: number) => ({
          time: `${interval === "1H" ? "Hour" : "Day"} ${index + 1}`,
          price: parseFloat(candle[4]),
        }));
        setChartData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.log(interval);
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [interval, limit, pair]);

  const handleTimeframeChange = (
    days: number,
    interval: string,
    label: string
  ) => {
    setTimeframe(label);
    setLimit(days);
    setInterval(interval);
  };
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{pair} Price Chart</CardTitle>
          <div className="flex gap-2">
            {[
              { label: "24H", interval: "1h", days: 24 },
              { label: "14D", interval: "1d", days: 14 },
              { label: "30D", interval: "1d", days: 30 },
            ].map((tf) => (
              <Button
                key={tf.label}
                variant={timeframe === tf.label ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleTimeframeChange(tf.days, tf.interval, tf.label)
                }
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
              <Chart data={chartData}>
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
                    chartData[0].price > chartData[chartData.length - 1].price
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
};

export default CryptoChart;
