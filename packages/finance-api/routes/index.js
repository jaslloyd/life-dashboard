const express = require("express");
const router = express.Router();
const DeGiro = require("degiro");
const fetch = require("node-fetch");

// TODO: Use POST request
router.get("/login/:code", async (req, res) => {
  const code = req.params.code;
  const degiro = DeGiro.create({
    oneTimePassword: code,
    debug: true,
  });
  try {
    await degiro.login();

    // TODO: Find out age of degiro cookies
    res.cookie("SESSION_ID", degiro.session.id, {
      maxAge: 90000000,
      httpOnly: true,
    });
    res.send({
      status: "success",
      message: "Login Successful",
      id: degiro.session.id,
      accountId: degiro.session.account,
    });
  } catch (e) {
    res
      .json({
        status: "failed",
        message: e.toString(),
      })
      .status(500);
  }
});

// TODO: Use Cookies to get session id later
router.get("/portfolio", async (req, res) => {
  if (!req.cookies.SESSION_ID) {
    res
      .json({
        status: "failed",
        message: "Please re-login to your investment account",
      })
      .status(401);
  } else {
    const degiro = DeGiro.create({
      sessionId: req.cookies.SESSION_ID,
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
      const USD_TOTAL = result
        .filter((result) => result.stockCurrency === "USD")
        .reduce((acc, curr) => acc + curr.totalPositionValue, 0);
      const EUR_TOTAL = result
        .filter((result) => result.stockCurrency === "EUR")
        .reduce((acc, curr) => acc + curr.totalPositionValue, 0);

      console.log("USD Total Exchanged into EUR " + USD_TOTAL * rates.EUR);

      res.json({
        USD_TOTAL,
        EUR_TOTAL,
        result,
        portfolio,
      });
    } catch (e) {
      res.json({
        status: "failed",
        message: e.toString(),
      });
    }
  }
});

module.exports = router;
