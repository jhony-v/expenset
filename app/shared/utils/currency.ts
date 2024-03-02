import { Currency } from "@/app/constants";

export function getCurrencyByCode(code: number) {
  return code === Currency.PEN.code ? Currency.PEN : Currency.USD;
}
