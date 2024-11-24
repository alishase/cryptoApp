"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoChart } from "@/components/crypto-chart";
import { MarketOverview } from "@/components/market-overview";
import { useToast } from "../../hooks/use-toast";
import { Wallet, ArrowUpDown, Clock } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface WalletBalance {
  currency: string;
  balance: number;
  address: string;
  usdValue: number;
}

interface DashboardData {
  totalBalance: number;
  wallets: WalletBalance[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

  if (status === "loading") {
    <div>Loading...</div>;
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch wallets and total balance
      const totalResponse = await fetch("/api/wallet/total-balance");
      const totalData: DashboardData = await totalResponse.json();
      setTotalBalance(totalData.totalBalance);
      setWallets(totalData.wallets);

      // Fetch transactions
      const transactionsResponse = await fetch("/api/transactions");
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {wallets.map((wallet) => (
                <div key={wallet.currency} className="flex justify-between">
                  <span>{wallet.currency}:</span>
                  <span>
                    $
                    {wallet.usdValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Wallets
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
            <p className="text-xs text-muted-foreground">
              Different cryptocurrencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.length > 0 ? transactions[0].type : "No activity"}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.length > 0
                ? new Date(transactions[0].createdAt).toLocaleDateString(
                    "en-US"
                  )
                : "No recent transactions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview and Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <MarketOverview />
        <CryptoChart />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{transaction.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {transaction.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}{" "}
                    {transaction.currency}
                  </p>
                  <p
                    className={`text-sm ${
                      transaction.status === "COMPLETED"
                        ? "text-green-500"
                        : transaction.status === "PENDING"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
