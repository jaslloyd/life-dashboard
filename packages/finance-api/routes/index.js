const express = require("express");
const router = express.Router();
const DeGiro = require("degiro");
const fetch = require("node-fetch");
const { login, getPortfolio } = require("../lib/degiro");

// TODO: Use POST request
router.post("/login", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(401).json({
      status: "failed",
      message: "Login Code is Required",
    });
  }

  try {
    const { id, accountId } = await login(code);

    res.send({
      status: "success",
      message: "Login Successful",
      id,
      accountId,
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
    try {
      const {
        overallTotalInEuro,
        portfolioItems,
        portfolio,
      } = await getPortfolio(req.headers.authorization);

      res.json({
        overallTotalInEuro,
        portfolioItems,
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
