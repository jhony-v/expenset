"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState, memo } from "react";
import { ColorType, LineType, Time, createChart } from "lightweight-charts";
import { Checkbox, colors } from "@nextui-org/react";
import { Movement } from "@/app/shared/types";
import { MovementType } from "@/app/constants";

export default memo(function Chart({
  movements,
  locked,
}: {
  movements: Array<Movement>;
  locked: boolean;
}) {
  const [visibleIncomes, setVisibleIncomes] = useState(true);
  const [visibleExpense, setVisibleExpense] = useState(true);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const movementsDataset = useMemo(() => {
    return movements
      .map((movement: any) => {
        return {
          time: dayjs(movement.created_at).toDate().getTime() as Time,
          value: movement.amount,
          type: movement.type,
        };
      })
      .reverse();
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
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    chart.timeScale().fitContent();

    if (visibleExpense) {
      const expenseSeries = chart.addAreaSeries({
        lineColor: colors.red[400],
        topColor: colors.red[400],
        bottomColor: "rgba(242, 176, 95, 0.1)",
        lineType: LineType.Curved,
        title: "expense",
      });
      expenseSeries.setData(expenseDataSet);
    }

    if (visibleIncomes) {
      const incomeSeries = chart.addAreaSeries({
        lineColor: colors.blue[400],
        topColor: colors.blue[400],
        bottomColor: "rgba(242, 176, 95, 0.1)",
        lineType: LineType.Curved,
        title: "income",
      });
      incomeSeries.setData(incomeDataSet);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [expenseDataSet, incomeDataSet, visibleIncomes, visibleExpense]);

  return (
    <div className={`m-0 relative ${locked ? "blur-sm" : ""}`}>
      <div className="flex gap-6 mb-2">
        <Checkbox
          color="danger"
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
