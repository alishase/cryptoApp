// lib/rates.ts (замена твоего файла)
import axios from "axios";

const COINBASE_EX_API = "https://api.exchange.coinbase.com";
const COINBASE_RETAIL_API = "https://api.coinbase.com";
const client = axios.create({ timeout: 8000 });

export interface ExchangeRate {
  symbol: string; // например "BTC-USD"
  price: string; // строка как и раньше
}

const STABLES = new Set(["USD", "USDT", "USDC", "BUSD", "FDUSD", "TUSD"]);
const isStable = (s: string) => STABLES.has(s.toUpperCase());
const ensureFinite = (n: unknown, msg: string) => {
  const v = Number(n);
  if (!Number.isFinite(v)) throw new Error(msg);
  return v;
};

/** Цена в USD для монеты через Coinbase (сначала Exchange, затем Retail как запасной канал). */
async function getCoinbasePriceUSD(symbol: string): Promise<number> {
  const sym = symbol.toUpperCase();

  // 1) Coinbase Exchange: /products/{SYM}-USD/ticker
  try {
    const { data } = await client.get(
      `${COINBASE_EX_API}/products/${sym}-USD/ticker`,
      { headers: { "User-Agent": "rates-fetcher" } }
    );
    return ensureFinite(
      data?.price,
      `Non-finite price from Exchange for ${sym}-USD`
    );
  } catch (_) {
    // fall through
  }

  // 2) Coinbase Retail: /v2/prices/{SYM}-USD/spot
  const { data } = await client.get(
    `${COINBASE_RETAIL_API}/v2/prices/${sym}-USD/spot`,
    { headers: { "User-Agent": "rates-fetcher" } }
  );
  return ensureFinite(
    data?.data?.amount,
    `Non-finite price from Retail for ${sym}-USD`
  );
}

/** Совместимость: прежнее имя. Под капотом берём цену {BASE}-USD. */
export async function getBinancePrice(symbol: string): Promise<number> {
  // Поддержим старый формат вроде "BTCUSDT" или "ETHUSD"
  const S = symbol.toUpperCase();
  const m = S.match(/^([A-Z0-9]+)(USD|USDT)$/);
  if (!m)
    throw new Error(`Unsupported symbol "${symbol}" (expected *USD or *USDT)`);
  const base = m[1];
  // USDT считаем как USD
  return getCoinbasePriceUSD(base);
}

/** Кросс-курс между валютами. USD и USDT — 1:1 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) return 1;
  if (isStable(from) && isStable(to)) return 1;

  // stable -> crypto
  if (isStable(from) && !isStable(to)) {
    const p = await getCoinbasePriceUSD(to); // USD per 1 coin
    return ensureFinite(1 / p, `Invalid rate ${from}/${to}`);
  }

  // crypto -> stable
  if (!isStable(from) && isStable(to)) {
    const p = await getCoinbasePriceUSD(from);
    return ensureFinite(p, `Invalid rate ${from}/${to}`);
  }

  // crypto -> crypto (через USD)
  const [pf, pt] = await Promise.all([
    getCoinbasePriceUSD(from),
    getCoinbasePriceUSD(to),
  ]);
  return ensureFinite(pf / pt, `Invalid rate ${from}/${to}`);
}

/** Все цены: вернём USD-пары с Coinbase Exchange. Ограничим до 100 шт. */
export async function getAllPrices(): Promise<ExchangeRate[]> {
  const { data: products } = await client.get(`${COINBASE_EX_API}/products`, {
    headers: { "User-Agent": "rates-fetcher" },
  });

  // Берём только пары к USD
  const usdPairs = (Array.isArray(products) ? products : [])
    .filter((p: any) => p?.quote_currency?.toUpperCase() === "USD")
    .slice(0, 100); // чтобы не долбить API

  const tickers = await Promise.allSettled(
    usdPairs.map((p: any) =>
      client.get(`${COINBASE_EX_API}/products/${p.id}/ticker`, {
        headers: { "User-Agent": "rates-fetcher" },
      })
    )
  );

  const out: ExchangeRate[] = [];
  tickers.forEach((r: PromiseSettledResult<any>, i: number) => {
    if (r.status === "fulfilled") {
      const price = r.value?.data?.price;
      if (Number.isFinite(Number(price))) {
        out.push({ symbol: usdPairs[i].id, price: String(price) }); // "BTC-USD", "ETH-USD", ...
      }
    }
  });

  return out;
}
