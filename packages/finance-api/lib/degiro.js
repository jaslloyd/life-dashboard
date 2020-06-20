const DeGiro = require("degiro");
const fetch = require("node-fetch");

const login = (code) => {
  return new Promise(async (resolve, rej) => {
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
  });
};

module.exports = {
  login,
};
