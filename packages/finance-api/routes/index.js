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

    res.cookie("SESSION_ID", degiro.session.id, {
      maxAge: 900000,
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
  const degiro = DeGiro.create({
    sessionId: req.cookies.SESSION_ID,
  });

  try {
    await degiro.updateConfig();
    const portfolio = await degiro.getPortfolio();

    res.json({
      portfolio,
    });
  } catch (e) {
    res.json({
      status: "failed",
      message: e.toString(),
    });
  }
});

module.exports = router;
