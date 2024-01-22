"use client";
import OverviewBudget from "@/app/(default)/components/OverviewBudget";
import { MovementType } from "@/app/constants";
import { Budget, Movement } from "@/app/shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  commonColors,
  getKeyValue,
} from "@nextui-org/react";
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
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="w-auto overflow-x-auto">
        <div className="w-full md:w-[600px] h-[400px] mx-auto">
          <ResponsivePie
            data={data}
            margin={{ top: 20, bottom: 20, left: 70, right: 70 }}
            colors={[
              commonColors.blue[200],
              commonColors.blue[400],
              commonColors.purple[200],
              commonColors.purple[300],
              commonColors.purple[400],
              commonColors.cyan[200],
            ].reverse()}
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
            tooltip={(payload) => (
              <div className="bg-black rounded-xl text-sm p-2">
                {payload.datum.id}: {payload.datum.value}
              </div>
            )}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
          />
        </div>
      </div>
      <div className="space-y-5 flex-1 mb-4">
        <OverviewBudget
          budget={budget}
          locked={budget.settings.locked.active}
        />
        <Table aria-label="expense by categorie">
          <TableHeader
            columns={[
              { key: "id", label: "Category" },
              { key: "value", label: "Amount" },
            ]}
          >
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={data}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
