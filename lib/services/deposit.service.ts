export async function getOrCreateDepositAddress(
  userId: string,
  currency: string
) {
  let depositAddress = "";
  // Check for existing address
  switch (currency) {
    case "BTC":
      depositAddress = "bc1q8sx8j787xcdulwpw589qyvjtdxe68qnw8urerp";
      break;
    case "USDT":
      depositAddress = "TBWCCq2qrU87a3tXLciFLCRu41XW6ZH7EZ";
      break;
    case "TON":
      depositAddress = "UQB2pX-OpWmUKPiAoWF9UsnOUS_WylaZ9SPCa_3nN5je8j1D";
      break;
    case "ETH":
      depositAddress = "0x1482ca50aB7d38480339748319A9Cc8D7C250670";
  }

  return depositAddress;
}
