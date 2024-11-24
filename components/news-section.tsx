"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

const news = [
  {
    id: 1,
    title: "Bitcoin Reaches New All-Time High",
    date: "2024-03-14",
    summary: "Bitcoin surpasses previous records as institutional adoption continues to grow.",
    source: "CryptoNews",
    category: "Market Update"
  },
  {
    id: 2,
    title: "Ethereum 2.0 Update Progress",
    date: "2024-03-13",
    summary: "The Ethereum network continues its transition to proof-of-stake with new milestones.",
    source: "BlockchainDaily",
    category: "Technology"
  },
  {
    id: 3,
    title: "New Regulations for Crypto Exchanges",
    date: "2024-03-12",
    summary: "Regulatory bodies announce new guidelines for cryptocurrency exchanges.",
    source: "CryptoInsider",
    category: "Regulation"
  }
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
                <span className="text-sm text-muted-foreground">{item.date}</span>
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