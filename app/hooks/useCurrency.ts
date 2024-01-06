import { useFormatter } from "next-intl";

export default function useCurrency() {
  const formatter = useFormatter();

  const currency = (value: number) => {
    return formatter.number(value, {
      currency: "PEN",
      currencySign: "standard",
    });
  };

  return currency;
}
