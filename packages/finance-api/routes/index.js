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
router.get("/portfolio/:sid", async (req, res) => {
  console.log(req.params.sid);
  const degiro = DeGiro.create({
    sessionId: req.params.sid,
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
