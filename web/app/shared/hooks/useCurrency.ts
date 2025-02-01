import { useFormatter } from "next-intl";
import { Currency, CurrencyCode } from "@/app/constants";

export default function useCurrency() {
  const formatter = useFormatter();

  const currency = (value: number, currency: CurrencyCode | null = null) => {
    const currencySelected =
      currency !== null ? Currency[currency] : Currency.PEN;
    const formattedValue = formatter.number(value, {
      currency: currencySelected.code as string,
      currencySign: "standard",
    });

    return `${currencySelected.symbol} ${formattedValue}`;
  };

  return currency;
}
