//External libs
const express = require("express");
const webdriver = require("selenium-webdriver");
const bodyparser = require("body-parser");
const chrome = require("selenium-webdriver/chrome");

//Create express app
const app = express();
app.use(bodyparser.json());

//Setup driver
let driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(new chrome.Options().headless())
  .build();

driver.manage().setTimeouts({ implicit: 5000, pageLoad: 5000 });

//Routes
app.post("/wifi/:status", async function (req, res, next) {
  let cont = true;
  console.log("connect");

  if (req.body.password != "ccd98752-bfda-4853-8457-43b8eb86bba8") {
    next("Fuck off");
    cont = false;
  }

  if (cont) {
    await driver.get("http://192.168.2.1/").catch(() => {
      cont = false;
      next("Cant connect with WLAN");
    });
  }
  msleep(1000);
  if (cont) {
    await driver
      .findElement(webdriver.By.name("password"))
      .sendKeys("92682001")
      .catch(() => {
        cont = false;
        next("Cant enter password on WLAN");
      });
  }
  if (cont) {
    await driver
      .findElement(webdriver.By.name("action"))
      .click()
      .catch(() => {
        cont = false;
        next("Cant login");
      });
  }
  msleep(1000);

  let script = "";
  switch (req.params.status) {
    case "on":
      script =
        "setWLANConnectionActive(true);setWLAN5GHzConnectionActive(true)";
      break;
    case "off":
      script =
        "setWLANConnectionActive(false);setWLAN5GHzConnectionActive(false)";
      break;
    default:
      cont = false;
      next("That shit doesnt fly here!");
      break;
  }

  if (cont) {
    await driver.executeScript(script).catch(() => {
      cont = false;
      next("Cant change WLAN status");
    });
  }
  if (cont) {
    switch (req.params.status) {
      case "on":
        res.send("WLAN turned on");
        break;
      case "off":
        res.send("WLAN turned off");
        break;
      default:
        res.send("what");
    }
  }
});

//Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send(err);
});

//Start server
app.listen(2724, function () {
  console.log("wasMK2Redux listening on port 2724!");
});

//Additional functions
function msleep(n) {
  // eslint-disable-next-line no-undef
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
