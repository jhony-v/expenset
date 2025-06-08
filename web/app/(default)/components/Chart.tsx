"use client";

import dayjs from "dayjs";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  startTransition,
} from "react";
import {
  ColorType,
  ISeriesApi,
  LineStyle,
  LineType,
  MouseEventParams,
  Time,
  createChart,
} from "lightweight-charts";
import { Checkbox, colors } from "@nextui-org/react";
import { Movement } from "@/app/shared/types";
import { CurrencyCode, MovementType } from "@/app/constants";
import { debounce } from "@/app/shared/utils/debounce";

const graphicColors = {
  icome: {
    lineColor: `rgba(241,99,18, 1)`,
    topColor: "rgba(241,19,10, 0.4)",
    bottomColor: "rgba(241,99,18, 0.1)",
  },
  expense: {
    lineColor: "rgba(291, 299, 290, 1)",
    topColor: "rgba(191, 199, 198, 0.1)",
    bottomColor: "rgba(291, 299, 290, 0.2)",
  },
  monthly: {
    lineColor: "rgba(91, 299, 218, 1)",
    topColor: "rgba(91, 199, 118, 0.1)",
    bottomColor: "rgba(91, 299, 218, 0.2)",
  },
};

export default memo(function Chart({
  movements,
  locked,
  onCrosshairMoveData,
}: {
  movements: Array<Movement>;
  locked: boolean;
  onCrosshairMoveData(data: any): void;
}) {
  const [visibleIncomes, setVisibleIncomes] = useState(true);
  const [visibleExpense, setVisibleExpense] = useState(true);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const movementsDataset = useMemo(() => {
    type ResultEntity = Record<string, Partial<Movement> & { amount: number }>;
    const result: {
      expense: ResultEntity;
      income: ResultEntity;
    } = {
      expense: {},
      income: {},
    };
    for (const movement of movements) {
      const { type, amount, created_at, currency, rate } = movement;
      const date = dayjs(created_at).format("YYYY-MM-DD");
      const finalAmount = amount * (currency === CurrencyCode.USD ? rate : 1);
      if (!result[type][date]) {
        result[type][date] = {
          amount: finalAmount,
          type,
          created_at: date,
        };
        continue;
      }
      result[type][date].amount += finalAmount;
    }
    const groupedMovements = [
      ...Object.values(result.income),
      ...Object.values(result.expense),
    ];
    return groupedMovements
      .map((movement) => {
        return {
          time: movement.created_at as Time,
          value: movement.amount,
          type: movement.type,
        };
      })
      .reverse();
  }, [movements]);

  const expenseMonthly = useMemo(() => {
    const result: Record<
      string,
      {
        time: string;
        value: number;
      }
    > = {};
    for (const movement of movements) {
      if (movement.type === MovementType.EXPENSE) {
        const date = dayjs(movement.created_at)
          .startOf("month")
          .format("YYYY-MM-DD");
        if (!result[date]) {
          result[date] = {
            time: date,
            value: movement.amount,
          };
        } else {
          result[date].value += movement.amount;
        }
      }
    }
    return Object.values(result).reverse();
  }, [movements]);

  const expenseDataSet = movementsDataset.filter(
    (movement: any) => movement.type === MovementType.EXPENSE
  );
  const incomeDataSet = movementsDataset.filter(
    (movement: any) => movement.type === MovementType.INCOME
  );

  useEffect(() => {
    if (chartContainerRef.current === null) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: colors.black,
        },
        textColor: colors.white,
      },
      grid: {
        vertLines: {
          color: colors.zinc[700],
        },
        horzLines: {
          color: colors.zinc[700],
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: window.matchMedia("(min-width: 700px)").matches ? 600 : 300,
    });

    chart.timeScale().fitContent();

    let expenseSeries: ISeriesApi<"Area">;
    let incomeSeries: ISeriesApi<"Area">;
    const lineType = LineType.Curved;

    if (visibleExpense) {
      expenseSeries = chart.addAreaSeries({
        lineColor: graphicColors.expense.lineColor,
        topColor: graphicColors.expense.topColor,
        bottomColor: graphicColors.expense.bottomColor,
        lineType,
        title: "expense",
      });
      expenseSeries.setData(expenseDataSet);
    }

    if (visibleIncomes) {
      incomeSeries = chart.addAreaSeries({
        lineColor: graphicColors.icome.lineColor,
        topColor: graphicColors.icome.topColor,
        bottomColor: graphicColors.icome.bottomColor,
        lineType,
      });
      incomeSeries.setData(incomeDataSet);
    }

    const expenseMonthlySeries = chart.addAreaSeries({
      title: "monthly",
      lineColor: graphicColors.monthly.lineColor,
      topColor: graphicColors.monthly.topColor,
      bottomColor: graphicColors.monthly.bottomColor,
      lineType: LineType.Simple,
      lineStyle: LineStyle.SparseDotted,
    });
    expenseMonthlySeries.setData(expenseMonthly);

    const getMovementsIdsInSeries = (
      param: MouseEventParams<Time>,
      serie: ISeriesApi<"Area">,
      type: MovementType
    ) => {
      const data = param.seriesData.get(serie);
      return serie
        ? new Set(
            movements
              .filter(
                (movement) =>
                  dayjs(movement.created_at).format("YYYY-MM-DD") ===
                    data?.time && movement.type === type
              )
              .map((movement) => movement.id)
          )
        : new Set();
    };

    const handlerCrosshairMove = debounce((param: MouseEventParams<Time>) => {
      if (param.time === undefined) {
        onCrosshairMoveData?.({
          expense: new Set(),
          income: new Set(),
        });
        return;
      }
      startTransition(() => {
        onCrosshairMoveData?.({
          expense: getMovementsIdsInSeries(
            param,
            expenseSeries,
            MovementType.EXPENSE
          ),
          income: getMovementsIdsInSeries(
            param,
            incomeSeries,
            MovementType.INCOME
          ),
        });
      });
    }, 250);
    chart.subscribeCrosshairMove(handlerCrosshairMove);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.unsubscribeCrosshairMove(handlerCrosshairMove);
      chart.remove();
    };
  }, [
    expenseDataSet,
    incomeDataSet,
    visibleIncomes,
    visibleExpense,
    expenseMonthly,
    movements,
    onCrosshairMoveData,
  ]);

  return (
    <div className={`m-0 relative ${locked ? "blur-sm" : ""}`}>
      <div className="flex gap-6 mb-2 items-center whitespace-nowrap">
        <Checkbox
          color="default"
          size="sm"
          isSelected={visibleExpense}
          onValueChange={setVisibleExpense}
        >
          Show expense
        </Checkbox>
        <Checkbox
          color="primary"
          size="sm"
          isSelected={visibleIncomes}
          onValueChange={setVisibleIncomes}
        >
          Show income
        </Checkbox>
      </div>
      <div ref={chartContainerRef} data-area="graphic" />
      {locked && (
        <div className="absolute w-full h-full top-0 left-0 z-20"></div>
      )}
    </div>
  );
});
