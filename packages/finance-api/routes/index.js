const express = require("express");
const router = express.Router();
const DeGiro = require("degiro");

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

      const result = Object.keys(productNames.data).map((pid) => {
        const personalProductInfo = portfolio.portfolio.find(
          (p) => p.id === pid
        ).value;

        const findSpecificValue = (personalValues, valueToFind) =>
          personalValues.find((values) => values.name === valueToFind).value;

        return {
          id: pid,
          tickerSymbol: productNames.data[pid].symbol,
          name: productNames.data[pid].name,
          productType: productNames.data[pid].productType,
          sharesHeld: findSpecificValue(personalProductInfo, "size"),
          currentStockValue: findSpecificValue(personalProductInfo, "price"),
          stockValueBreakEvenPrice: findSpecificValue(
            personalProductInfo,
            "breakEvenPrice"
          ),
          totalPositionValue: findSpecificValue(personalProductInfo, "value"),
          stockCurrency: productNames.data[pid].currency,
        };
      });

      res.json({
        result,
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
