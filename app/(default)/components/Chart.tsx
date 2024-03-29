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
import { Budget, Movement } from "@/app/shared/types";
import { MovementType } from "@/app/constants";
import { debounce } from "@/app/shared/utils/debounce";

export default memo(function Chart({
  movements,
  locked,
  onCrosshairMoveData,
  budget,
}: {
  movements: Array<Movement>;
  locked: boolean;
  onCrosshairMoveData(data: any): void;
  budget: Budget;
}) {
  const [visibleIncomes, setVisibleIncomes] = useState(true);
  const [visibleExpense, setVisibleExpense] = useState(true);
  const {
    settings: { exchanges },
  } = budget;

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
      const { type, amount, created_at, currency } = movement;
      const date = dayjs(created_at).format("YYYY-MM-DD");
      const finalAmount = amount * (exchanges[currency] ?? 1);
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
  }, [movements, exchanges]);

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
        lineColor: colors.purple[400],
        topColor: colors.purple[400],
        bottomColor: "rgba(128, 0, 128, 0.1)",
        lineType,
        title: "expense",
      });
      expenseSeries.setData(expenseDataSet);
    }

    if (visibleIncomes) {
      incomeSeries = chart.addAreaSeries({
        lineColor: colors.blue[400],
        topColor: colors.blue[400],
        bottomColor: "rgba(24, 76, 245, 0.1)",
        lineType,
      });
      incomeSeries.setData(incomeDataSet);
    }

    const expenseMonthlySeries = chart.addAreaSeries({
      title: "monthly",
      lineColor: colors.red[400],
      topColor: "rgba(242, 76, 65, 0.1)",
      bottomColor: "rgba(242, 76, 65, 0.1)",
      lineType: LineType.WithSteps,
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
          color="secondary"
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
