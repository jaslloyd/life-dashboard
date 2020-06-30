const DeGiro = require("degiro");
const fetch = require("node-fetch");

const LIQUIDITY_FUNDS_TO_IGNORE = [
  "15694498",
  "15694501",
  "14858895",
  "4667924",
  "5173554",
  "4660556",
];

const login = async (code) => {
  const degiro = DeGiro.create({
    oneTimePassword: code,
    debug: true,
  });

  await degiro.login();

  return {
    id: degiro.session.id,
    accountId: degiro.session.account,
  };
};

const getPortfolio = async (sessionId) => {
  const degiro = DeGiro.create({
    sessionId,
  });

  await degiro.updateConfig();
  const portfolio = await degiro.getPortfolio();

  const { data: productData } = await degiro.getProductsByIds(
    portfolio.portfolio
      .filter(
        (p) =>
          ![...LIQUIDITY_FUNDS_TO_IGNORE, "EUR", "CAD", "USD"].includes(p.id)
      )
      .map((p) => p.id)
  );

  const takeValueFromPortfolio = (productInfo) => (valueToFind) =>
    productInfo.find((values) => values.name === valueToFind).value;

  const result = Object.keys(productData).map((pid) => {
    const personalProductInfo = portfolio.portfolio.find((p) => p.id === pid)
      .value;

    const findValue = takeValueFromPortfolio(personalProductInfo);

    const product = productData[pid];

    return {
      id: pid,
      tickerSymbol: product.symbol,
      name: product.name,
      productType: product.productType,
      sharesHeld: findValue("size"),
      currentStockValue: findValue("price"),
      stockValueBreakEvenPrice: +findValue("breakEvenPrice").toFixed(2),
      totalPositionValue: +findValue("value").toFixed(2),
      stockCurrency: product.currency,
      totalBreakEvenPrice: +(
        findValue("breakEvenPrice") * findValue("size")
      ).toFixed(2),
    };
  });

  const rates = await getCurrencyRates();

  const totalsByCurrencies = result.reduce((acc, curr) => {
    if (!acc[curr.stockCurrency]) {
      acc[curr.stockCurrency] = {
        currTotal: curr.totalPositionValue,
        breakEvenTotal: curr.totalBreakEvenPrice,
      };
    } else {
      acc[curr.stockCurrency] = {
        currTotal: (acc[curr.stockCurrency].currTotal +=
          curr.totalPositionValue),
        breakEvenTotal: (acc[curr.stockCurrency].breakEvenTotal +=
          curr.totalBreakEvenPrice),
      };
    }
    return acc;
  }, {});

  const overallTotalInEuro = +(
    totalsByCurrencies["EUR"].currTotal +
    totalsByCurrencies["USD"].currTotal * rates.EUR
  ).toFixed(0);

  const overBETotalInEuro = +(
    totalsByCurrencies["EUR"].breakEvenTotal +
    totalsByCurrencies["USD"].breakEvenTotal * rates.EUR
  ).toFixed(0);

  return {
    overallTotalInEuro,
    overBETotalInEuro,
    portfolioItems: result.sort((a, b) => a.name.localeCompare(b.name)),
    portfolio,
  };
};

const getCurrencyRates = async (baseRate = "USD") => {
  const { rates } = await (
    await fetch(`https://api.exchangeratesapi.io/latest?base=${baseRate}`)
  ).json();
  return rates;
};

module.exports = {
  login,
  getPortfolio,
};
