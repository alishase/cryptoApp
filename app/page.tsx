"use client";
import { CryptoChart } from "@/components/crypto-chart";
import { MarketOverview } from "@/components/market-overview";
import { NewsSection } from "@/components/news-section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
export default function Home() {
  return (
    <div className="space-y-8">
      <section className="mx-6 px-2 text-center py-16 bg-gradient-to-b from-background to-muted rounded-lg lg:mx-0 lg:px-0 sm:mx-10 sm:px-2">
        <h1 className="md:text-5xl font-bold mb-4 animate-appear delay-100 opacity-0 sm:text-3xl text-2xl">
          Trade free, Trade safe, Trade with us
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 md:5xl sm:text-xl">
          Experience secure and efficient cryptocurrency trading on our
          platform. Start your journey with instant deposits and withdrawals.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="default" variant="default">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/market">
            <Button variant="outline" size="default">
              View Markets
            </Button>
          </Link>
        </div>
      </section>

      <MarketOverview />

      <div className="grid md:grid-cols-2 gap-8">
        <CryptoChart />
        <NewsSection />
      </div>
    </div>
  );
}
