const express = require("express");
const router = express.Router();
const { login, getPortfolio } = require("../lib/degiro");

const API_STATUSES = {
  SUCCESS: "success",
  FAILED: "failed",
};

router.post("/login", async (req, res) => {
  const code = req.body.code;
  if (!code) {
    return res.status(401).json({
      status: API_STATUSES.FAILED,
      message: "Login Code is Required",
    });
  }

  try {
    const { id, accountId } = await login(code);

    res.send({
      status: API_STATUSES.SUCCESS,
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

router.get("/portfolio", async (req, res) => {
  if (!req.headers.authorization) {
    res.status(401).json({
      status: "failed",
      message: "Please re-login to your investment account",
    });
  } else {
    try {
      const {
        overallTotalInEuro,
        overBETotalInEuro,
        portfolioItems,
        portfolio,
      } = await getPortfolio(req.headers.authorization);

      res.json({
        status: API_STATUSES.SUCCESS,
        overallTotalInEuro,
        overBETotalInEuro,
        portfolioItems,
        portfolio,
      });
    } catch (e) {
      console.log(e);
      res.status(401).json({
        status: API_STATUSES.FAILED,
        message: e.toString(),
      });
    }
  }
});

module.exports = router;
