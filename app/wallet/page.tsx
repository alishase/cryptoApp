"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  ArrowRightLeft,
  Plus,
  RefreshCw,
  Calculator,
} from "lucide-react";
import { DepositAddressModal } from "@/components/wallet/deposit-address-modal";
// import { loadStripe } from "@stripe/stripe-js";
import { useExchangeRate } from "../../hooks/use-exchange-rates";
import { useToast } from "../../hooks/use-toast";
import { useUSDRates } from "../../hooks/use-usd-rates";

interface WalletBalance {
  currency: string;
  balance: number;
  address: string;
}

const SUPPORTED_CRYPTOS = ["BTC", "TON", "USDT"];
// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
// );

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [exchangeAmount, setExchangeAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USDT");
  const [isLoading, setIsLoading] = useState(false);

  // Get real-time exchange rates
  const depositRate = useExchangeRate("USD", selectedCrypto);
  const exchangeRate = useExchangeRate(fromCurrency, toCurrency);
  const usdRates = useUSDRates(SUPPORTED_CRYPTOS);

  const fetchWallets = async () => {
    try {
      const response = await fetch("/api/wallet", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add other headers here
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch wallets");
      }
      const data = await response.json();
      setWallets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch wallet balances: ${error}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    // Assuming `fetchWallets` is a function that fetches wallet data
    // This should include error handling for real-world applications

    fetchWallets();
  }, [session, router, toast]);

  // const fetchWallets = async () => {
  //   try {
  //     const response = await fetch("/api/wallet");
  //     const data = await response.json();
  //     setWallets(data);
  //   } catch (error) {
  //     console.error("Failed to fetch wallets:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch wallet balances",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const calculateUsdValue = (balance: number, currency: string) => {
    const rate = usdRates.find((r) => r.currency === currency)?.rate;
    return rate ? balance * rate : 0;
  };

  // const handleDeposit = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch("/api/payment/create-session", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         amount: parseFloat(depositAmount),
  //         cryptoCurrency: selectedCrypto,
  //       }),
  //     });

  //     const session = await response.json();
  //     const stripe = await stripePromise;

  //     if (stripe) {
  //       const { error } = await stripe.redirectToCheckout({
  //         sessionId: session.id,
  //       });
  //       if (error) throw error;
  //     }
  //   } catch (error) {
  //     console.error("Payment failed:", error);
  //     toast({
  //       title: "Payment Failed",
  //       description: "Unable to process your payment. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleExchange = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCurrency,
          toCurrency,
          amount: parseFloat(exchangeAmount),
          rate: exchangeRate.rate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Exchange failed");
      }

      await fetchWallets();
      setExchangeAmount("");
      toast({
        title: "Exchange Successful",
        description: `Successfully exchanged ${exchangeAmount} ${fromCurrency} to ${toCurrency}`,
      });
    } catch (error) {
      console.error("Exchange failed:", error);
      toast({
        title: "Exchange Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete exchange",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div
                  key={wallet.currency}
                  className="flex justify-between items-center p-4 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{wallet.currency}</p>
                    <p className="text-sm text-muted-foreground">
                      {wallet.address}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-right">
                      {wallet.currency === "USDT"
                        ? wallet.balance
                        : calculateUsdValue(
                            wallet.balance,
                            wallet.currency
                          ).toFixed(2)}
                      $
                    </p>
                    <p className="text-sm text-muted-foreground text-end">
                      {wallet.currency === "USDT" ? "" : wallet.balance}
                      {wallet.currency === "USDT" ? "" : wallet.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-6">
          {/* Deposit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Deposit Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <a href="https://wise.com/pay/me/gunnarh110" target="_blank ">
                  Deposit with Wise
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Deposit with crypto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DepositAddressModal />
            </CardContent>
          </Card>

          {/* Exchange */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Exchange Crypto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CRYPTOS.map((crypto) => (
                        <SelectItem key={crypto} value={crypto}>
                          {crypto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CRYPTOS.map((crypto) => (
                        <SelectItem key={crypto} value={crypto}>
                          {crypto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  placeholder={`Amount in ${fromCurrency}`}
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                />

                {/* Exchange Rate Display */}
                {exchangeRate.rate && exchangeAmount && (
                  <Card className="bg-secondary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">You will receive:</span>
                        <p className="font-bold">
                          {(
                            parseFloat(exchangeAmount) *
                            0.995 *
                            exchangeRate.rate
                          ).toFixed(8)}{" "}
                          {toCurrency}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Rate: 1 {fromCurrency} = {exchangeRate.rate.toFixed(8)}{" "}
                        {toCurrency}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        FEE: 0.5%
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleExchange}
                  disabled={
                    isLoading || !exchangeAmount || fromCurrency === toCurrency
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Exchange"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
