export const SUPPORTED_CURRENCIES = {
  USDT: {
    name: "Tether TRC20",
    symbol: "USDT",
    decimals: 6,
    minDeposit: 10,
    depositFee: 0.1,
  },
  TON: {
    name: "Toncoin",
    symbol: "TON",
    decimals: 9,
    minDeposit: 1,
    depositFee: 0.1,
  },
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    minDeposit: 0.0001,
    depositFee: 0.1,
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    minDeposit: 0.0001,
    depositFee: 0.1,
  },
} as const;
