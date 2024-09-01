import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import playwright from "playwright";

const app = new Hono();

let browser: playwright.Browser;

const launchBrowser = async () => {
  if (!browser) {
    browser = await playwright.chromium.launch({
      headless: true,
    });
  }
  return browser;
};

const cleanup = async () => {
  if (browser) {
    console.log("closing browser");
    await browser.close();
  }
};

app.get("/", async (c) => {
  const query = c.req.query();

  const exchange = {
    from: query.from?.toLowerCase(),
    to: query.to?.toLowerCase(),
  };

  if (exchange.from === exchange.to) {
    c.status(400);
    return c.json({
      message: "from and to must be different",
    });
  }

  if (!exchange.from || !exchange.to) {
    c.status(400);
    return c.json({
      message: "from and to are required",
    });
  }

  const browser = await launchBrowser();
  const url = `https://www.google.com/search?q=${exchange.from}+to+${exchange.to}`;
  const page = await browser.newPage();
  await page.goto(url);

  const containerId = "[data-attrid='Converter'] input[type='number']";

  const input = await page.$$(containerId);
  const result = await Promise.all(
    input.map(async (el) => {
      const value = await el.evaluate((el) => (el as HTMLInputElement).value);
      return Number(value || "0");
    })
  );

  await page.close();

  c.status(200);
  return c.json({
    from: {
      curreny: exchange.from,
      amount: result[0],
    },
    to: {
      curreny: exchange.to,
      amount: result[1],
    },
  });
});

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

export const handler = handle(app);

if (process.env.NODE_ENV !== "production") {
  serve(
    {
      fetch: app.fetch,
      port: 5000,
    },
    () => {
      console.log("Listening");
    }
  );
}
