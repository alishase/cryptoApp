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
import { useState } from "react";
import { Button } from "@/components/ui/button";

const generateData = (days: number) => {
  const data = [];
  const basePrice = 65000;
  for (let i = 0; i < days; i++) {
    const variance = Math.random() * 2000 - 1000;
    data.push({
      time: `Day ${i + 1}`,
      price: basePrice + variance,
    });
  }
  console.log(data);
  return data;
};

export function CryptoChart() {
  const [timeframe, setTimeframe] = useState("7D");
  const [data, setData] = useState(() => generateData(7));

  const handleTimeframeChange = (days: number, label: string) => {
    setTimeframe(label);
    setData(generateData(days));
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
                type="monotone"
                dataKey="price"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
            </Chart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
