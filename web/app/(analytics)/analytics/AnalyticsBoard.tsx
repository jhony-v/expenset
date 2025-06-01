"use client";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import { Currency, MovementType } from "@/app/constants";
import { Budget, Movement } from "@/app/shared/types";
import {
  Card,
  CardBody,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useMemo, useState } from "react";
import { LucideArrowLeft, LucideDatabase } from "lucide-react";

interface Totals {
  id: string;
  value: number;
  movements: Array<Movement>;
}

export default function AnalyticsBoard({
  movements,
}: {
  movements: Array<Movement>;
}) {
  const data = useMemo(() => {
    const result: Record<
      string,
      {
        date: string;
        totals: Totals[];
        monthlyExpenses: number;
        monthlyIncomes: number;
      }
    > = {};
    for (const movement of movements) {
      const date = dayjs(movement.created_at).format("YYYY-MM");
      if (!result[date]) {
        result[date] = {
          date,
          totals: [],
          monthlyExpenses: 0,
          monthlyIncomes: 0,
        };
      }
      const { category, type, currency } = movement;

      if (type === MovementType.EXPENSE) {
        const amount = Number(movement.amount.toFixed(2));

        const index = result[date].totals.findIndex(
          (item) => item.id === category.name
        );
        if (index !== -1) {
          result[date].totals[index].value += amount;
          result[date].totals[index].movements.push(movement);
        } else {
          result[date].totals.push({
            id: category.name,
            value: movement.amount,
            movements: [movement],
          });
        }
        result[date].monthlyExpenses += amount;
      } else {
        result[date].monthlyIncomes +=
          currency === Currency.USD.code
            ? movement.amount * movement.rate
            : movement.amount;
      }
    }
    return Object.values(result);
  }, [movements]);

  return (
    <section className="w-full">
      <div className="space-y-5 flex-1 mb-4 sm:columns-2 lg:columns-3">
        {data.map((item) => {
          return (
            <Card key={item.date}>
              <CardBody className="overflow-hidden">
                <div className="mb-4 flex justify-between">
                  <p className="text-sm font-bold">
                    {dayjs(item.date).format("MMMM YYYY")}
                  </p>
                  <Chip variant="flat">
                    <span className="text-slate-400">
                      {item.monthlyExpenses.toFixed(2)}
                    </span>{" "}
                    /{" "}
                    <span className="text-primary">
                      {item.monthlyIncomes.toFixed(2)}
                    </span>
                  </Chip>
                </div>
                <TableDetail totals={item.totals} />
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function TableDetail({ totals }: { totals: Array<Totals> }) {
  const [totalSelected, setTotalSelected] = useState<Totals | null>(null);
  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        {totalSelected !== null ? (
          <motion.div
            initial={{ opacity: 0, x: 100, position: "absolute" }}
            animate={{ opacity: 1, x: 0, position: "relative" }}
            exit={{ opacity: 0, x: 100, position: "absolute" }}
            key="movements"
            role="contentinfo"
          >
            <header className="flex items-center gap-unit-xs my-4">
              <LucideArrowLeft
                onClick={() => setTotalSelected(null)}
                size={20}
              />
              <p className="font-bold">{totalSelected.id}</p>
              <p className="ml-auto font-bold">
                total:{" "}
                <span className="text-sm">
                  {totalSelected.value.toFixed(2)}
                </span>
              </p>
            </header>
            <Table aria-label="expense by movements" removeWrapper>
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Description</TableColumn>
              </TableHeader>
              <TableBody>
                {totalSelected.movements.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => setTotalSelected(null)}
                  >
                    <TableCell>
                      {dayjs(item.created_at).format("DD/MM/YYYY hh:mm a")}
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -100, position: "absolute" }}
            animate={{ opacity: 1, x: 0, position: "relative" }}
            exit={{ opacity: 0, x: -100, position: "absolute" }}
            key="categories"
          >
            <Table
              aria-label="expense by categorie"
              removeWrapper
              selectionMode="single"
            >
              <TableHeader>
                <TableColumn>Category</TableColumn>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Movs.</TableColumn>
              </TableHeader>
              <TableBody>
                {totals.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => setTotalSelected(item)}
                  >
                    <TableCell className="flex items-center gap-2">
                      <LucideDatabase size={15} />
                      {item.id}
                    </TableCell>
                    <TableCell>{item.value.toFixed(2)}</TableCell>
                    <TableCell>{item.movements.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
