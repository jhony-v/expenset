import { getRequestConfig } from "next-intl/server";

const locales = ["en", "de"];

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`../messages/${locale || "en"}.json`)).default,
  };
});
