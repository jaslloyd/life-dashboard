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

      const takeValueFromPortfolio = (productInfo) => (valueToFind) =>
        productInfo.find((values) => values.name === valueToFind).value;

      const result = Object.keys(productNames.data).map((pid) => {
        const personalProductInfo = portfolio.portfolio.find(
          (p) => p.id === pid
        ).value;

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

      const { rates } = await (
        await fetch("https://api.exchangeratesapi.io/latest?base=USD")
      ).json();

      const totalsByCurrencies = result.reduce((acc, curr) => {
        if (!acc[curr.stockCurrency]) {
          acc[curr.stockCurrency] = curr.totalPositionValue;
        } else {
          acc[curr.stockCurrency] += curr.totalPositionValue;
        }
        return acc;
      }, {});

      const overallTotalInEuro = (
        totalsByCurrencies["EUR"] +
        totalsByCurrencies["USD"] * rates.EUR
      ).toFixed(0);

      res.json({
        overallTotalInEuro,
        portfolioItems: result,
        portfolio,
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
