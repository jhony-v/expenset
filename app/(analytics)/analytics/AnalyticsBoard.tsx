"use client";
import OverviewBudget from "@/app/(default)/components/OverviewBudget";
import { MovementType } from "@/app/constants";
import { Budget, Movement } from "@/app/shared/types";
import { ResponsivePie } from "@nivo/pie";
import { useMemo } from "react";

export default function AnalyticsBoard({
  movements,
  budget,
}: {
  movements: Array<Movement>;
  budget: Budget;
}) {
  const data = useMemo(() => {
    const result: { id: string; value: number }[] = [];
    for (const movement of movements) {
      if (movement.type === MovementType.EXPENSE) {
        const { category } = movement;
        const index = result.findIndex((item) => item.id === category.name);
        if (index !== -1) {
          result[index].value += movement.amount;
        } else {
          result.push({ id: category.name, value: movement.amount });
        }
      }
    }
    const parsed = result.map(({ id, value }) => ({
      id,
      value: Number(value.toFixed(2)),
    }));
    return parsed;
  }, [movements]);

  return (
    <div>
      <div className="w-auto overflow-x-auto">
        <div className="w-full md:w-[600px] h-[400px] mx-auto">
          <ResponsivePie
            data={data}
            margin={{ top: 40, bottom: 80, left: 70, right: 70 }}
            colors={{ scheme: "purples" }}
            innerRadius={0.5}
            padAngle={2}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#fff"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            defs={[
              {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                size: 4,
                padding: 1,
                stagger: true,
              },
              {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
              },
            ]}
            legends={[
              {
                anchor: "bottom",
                direction: "column",
                justify: false,
                translateX: -127,
                translateY: 50,
                itemsSpacing: 3,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#fff",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div className="md:flex justify-center">
        <OverviewBudget
          budget={budget}
          locked={budget.settings.locked.active}
        />
      </div>
    </div>
  );
}
