"use client";

import { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface WalletAddress {
  currency: string;
  address: string;
}

export function DepositAddressModal() {
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState("TON");
  const [walletAddress, setWalletAddress] = useState<WalletAddress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchWalletAddress = async (currency: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallet/address/${currency}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setWalletAddress({
        currency,
        address: data.address,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wallet address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    fetchWalletAddress(currency);
  };

  const copyToClipboard = async () => {
    if (!walletAddress?.address) return;

    try {
      await navigator.clipboard.writeText(walletAddress.address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          onClick={() => fetchWalletAddress(selectedCurrency)}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Get Deposit Address
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Cryptocurrency</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Currency</label>
            <Select
              value={selectedCurrency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_CURRENCIES).map(
                  ([symbol, config]) => (
                    <SelectItem key={symbol} value={symbol}>
                      {config.name} ({symbol})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : walletAddress ? (
            <>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress.address}`}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Address</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-3 rounded-md text-sm break-all">
                    {walletAddress.address}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Send only {selectedCurrency} to this address</p>
                <p>
                  • Minimum deposit:{" "}
                  {
                    SUPPORTED_CURRENCIES[
                      selectedCurrency as keyof typeof SUPPORTED_CURRENCIES
                    ].minDeposit
                  }{" "}
                  {selectedCurrency}
                </p>
                <p>• Deposits will be credited after network confirmation</p>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
