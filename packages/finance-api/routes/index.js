const express = require("express");
const router = express.Router();
const DeGiro = require("degiro");
const fetch = require("node-fetch");

// TODO: Use POST request
router.post("/login", async (req, res) => {
  console.log(req.body);
  const code = req.body.code;
  if (!code) {
    return res.status(401).json({
      status: "failed",
      message: "Login Code is Required",
    });
  }

  const degiro = DeGiro.create({
    oneTimePassword: code,
    debug: true,
  });
  try {
    await degiro.login();

    // TODO: Find out age of degiro cookies
    // res.cookie("SESSION_ID", degiro.session.id, {
    //   maxAge: 90000000,
    //   httpOnly: true,
    // });
    res.send({
      status: "success",
      message: "Login Successful",
      id: degiro.session.id,
      accountId: degiro.session.account,
    });
  } catch (e) {
    res.status(401).json({
      status: "failed",
      message: e.toString(),
    });
  }
});

// TODO: Use Cookies to get session id later
router.get("/portfolio", async (req, res) => {
  console.log(req.headers);
  if (!req.headers.authorization) {
    res.status(401).json({
      status: "failed",
      message: "Please re-login to your investment account",
    });
  } else {
    const degiro = DeGiro.create({
      sessionId: req.headers.authorization,
    });

    try {
      await degiro.updateConfig();
      const portfolio = await degiro.getPortfolio();

      const productIds = portfolio.portfolio.map((p) => p.id);
      const productNames = await degiro.getProductsByIds(productIds);

      let totalBreakEvenPrice = 0;

      const result = Object.keys(productNames.data).map((pid) => {
        const personalProductInfo = portfolio.portfolio.find(
          (p) => p.id === pid
        ).value;

        const findSpecificValue = (personalValues, valueToFind) =>
          personalValues.find((values) => values.name === valueToFind).value;

        // TODO: These give me very rough estimates, it doesn't account for currency or other factors, will do later
        totalBreakEvenPrice +=
          findSpecificValue(personalProductInfo, "breakEvenPrice") *
          findSpecificValue(personalProductInfo, "size");

        return {
          id: pid,
          tickerSymbol: productNames.data[pid].symbol,
          name: productNames.data[pid].name,
          productType: productNames.data[pid].productType,
          sharesHeld: findSpecificValue(personalProductInfo, "size"),
          currentStockValue: findSpecificValue(personalProductInfo, "price"),
          stockValueBreakEvenPrice: +findSpecificValue(
            personalProductInfo,
            "breakEvenPrice"
          ).toFixed(2),
          totalPositionValue: +findSpecificValue(
            personalProductInfo,
            "value"
          ).toFixed(2),
          stockCurrency: productNames.data[pid].currency,
        };
      });

      console.log(totalBreakEvenPrice);
      const { rates } = await (
        await fetch("https://api.exchangeratesapi.io/latest?base=USD")
      ).json();

      //TODO: Convert this USD total to Euro
      // Add the both above will only give me an approx value because degiro does crap tonnes of stuff around calculating the total portfolio value but approx is good enough
      const USD_TOTAL = +result
        .filter((result) => result.stockCurrency === "USD")
        .reduce((acc, curr) => acc + curr.totalPositionValue, 0)
        .toFixed(0);
      const EUR_TOTAL = +result
        .filter((result) => result.stockCurrency === "EUR")
        .reduce((acc, curr) => acc + curr.totalPositionValue, 0)
        .toFixed(0);

      const overallTotalInEuro = (EUR_TOTAL + USD_TOTAL * rates.EUR).toFixed(0);

      res.json({
        overallTotalInEuro,
        portfolioItems: result,
      });
    } catch (e) {
      console.log(e);
      res.status(401).json({
        status: "failed",
        message: e.toString(),
      });
    }
  }
});

module.exports = router;
