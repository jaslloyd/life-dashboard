const DeGiro = require("degiro");
const fetch = require("node-fetch");

const login = async (code) => {
  const degiro = DeGiro.create({
    oneTimePassword: code,
    debug: true,
  });

  try {
    await degiro.login();

    resolve({
      id: degiro.session.id,
      accountId: degiro.session.account,
    });
  } catch (e) {
    rej(e);
  }
};

const getPortfolio = async (sessionId) => {
  const degiro = DeGiro.create({
    sessionId,
  });

  await degiro.updateConfig();
  const portfolio = await degiro.getPortfolio();

  const productIds = portfolio.portfolio.map((p) => p.id);
  const productNames = await degiro.getProductsByIds(productIds);

  const takeValueFromPortfolio = (productInfo) => (valueToFind) =>
    productInfo.find((values) => values.name === valueToFind).value;

  const result = Object.keys(productNames.data).map((pid) => {
    const personalProductInfo = portfolio.portfolio.find((p) => p.id === pid)
      .value;

    const findValue = takeValueFromPortfolio(personalProductInfo);

    return {
      id: pid,
      tickerSymbol: productNames.data[pid].symbol,
      name: productNames.data[pid].name,
      productType: productNames.data[pid].productType,
      sharesHeld: findValue("size"),
      currentStockValue: findValue("price"),
      stockValueBreakEvenPrice: +findValue("breakEvenPrice").toFixed(2),
      totalPositionValue: +findValue("value").toFixed(2),
      stockCurrency: productNames.data[pid].currency,
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

  console.log(totalsByCurrencies);

  const overallTotalInEuro = (
    totalsByCurrencies["EUR"].currTotal +
    totalsByCurrencies["USD"].currTotal * rates.EUR
  ).toFixed(0);

  const overBETotalInEuro = (
    totalsByCurrencies["EUR"].breakEvenTotal +
    totalsByCurrencies["USD"].breakEvenTotal * rates.EUR
  ).toFixed(0);
  console.log(overallTotalInEuro - overBETotalInEuro);

  return {
    overallTotalInEuro,
    portfolioItems: result,
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
