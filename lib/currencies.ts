export const SUPPORTED_CURRENCIES = {
  TON: {
    name: "Toncoin",
    symbol: "TON",
    decimals: 9,
    minDeposit: 1,
    depositFee: 0.1, // 0.1%
  },
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    minDeposit: 0.001,
    depositFee: 0.1,
  },
  USDT: {
    name: "Tether",
    symbol: "USDT",
    decimals: 6,
    minDeposit: 10,
    depositFee: 0.1,
  },
} as const;
