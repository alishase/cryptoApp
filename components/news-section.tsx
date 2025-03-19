"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

const news = [
  {
    id: 1,
    title: "$424 Million BTC in Hours: What’s Happening?",
    date: "02/08/2025",
    summary:
      "Blockchain data tracker Whale Alert recently reported a significant movement of $424 million worth of Bitcoin (BTC) across three separate transactions during the last 24 hours",
    source: "UToday",
    category: "BTC News",
  },
  {
    id: 2,
    title:
      "Bitcoin price today: drops to $96K as Trump's tariff warning roils risk sentiment",
    date: "02/07/2025",
    summary:
      "Bitcoin climbed on Friday after U.S. President Donald Trump’s warned of imposing reciprocal tariffs on many countries next week marked a blow to sentiment on risk assets including cryptos.",
    source: "Investing.com",
    category: "Market News",
  },
];

export function NewsSection() {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6" />
          <CardTitle className="text-2xl">Latest News</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="border-b pb-4 last:border-b-0 hover:bg-muted/50 p-4 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  {item.category}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.date}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.summary}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                Source: {item.source}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
