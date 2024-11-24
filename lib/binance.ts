import axios from "axios";

const BINANCE_API_URL = "https://api.binance.com/api/v3";

export interface ExchangeRate {
  symbol: string;
  price: string;
}

export async function getBinancePrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
      params: { symbol: symbol.toUpperCase() },
    });
    return parseFloat(response.data.price);
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    throw error;
  }
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  try {
    if (fromCurrency === toCurrency) return 1;

    if (fromCurrency === "USD" && toCurrency === "USDT") {
      return 1;
    }

    if (fromCurrency === "USDT" && toCurrency === "USD") {
      return 1;
    }

    // For USD to crypto conversion
    if (fromCurrency === "USD" || fromCurrency === "USDT") {
      const price = await getBinancePrice(`${toCurrency}USDT`);
      return 1 / price;
    }

    // For crypto to USD conversion
    if (toCurrency === "USD" || toCurrency === "USDT") {
      const price = await getBinancePrice(`${fromCurrency}USDT`);
      return price;
    }

    // For crypto to crypto conversion
    const fromPrice = await getBinancePrice(`${fromCurrency}USDT`);
    const toPrice = await getBinancePrice(`${toCurrency}USDT`);
    return fromPrice / toPrice;
  } catch (error) {
    console.error("Failed to calculate exchange rate:", error);
    throw error;
  }
}

export async function getAllPrices(): Promise<ExchangeRate[]> {
  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all prices:", error);
    throw error;
  }
}
