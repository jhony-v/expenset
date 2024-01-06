"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Input,
  Modal,
  ModalContent,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  colors,
} from "@nextui-org/react";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MovementType } from "../constants";
import TrendingDown from "@/app/icons/TrendingDown";
import TrendingUp from "@/app/icons/TrendingUp";
import LockContent from "./LockContent";
import dayjs from "dayjs";
import { createChart, ColorType, LineType, Time } from "lightweight-charts";
import { Budget, Movement } from "@/app/types";

export default function BoardExpenseTracker({ session }: { session: Session }) {
  const supabase = createClientComponentClient();
  const userId = session.user.id;
  const navigation = useRouter();

  const { data: budget, refetch: refetchBudget } = useQuery({
    queryKey: ["budget"],
    queryFn: () =>
      supabase
        .from("budget")
        .select()
        .eq("user_id", userId)
        .then((e) => e.data?.[0]) as Promise<Budget>,
    initialData: {
      amount: 0,
      expense: 0,
      income: 0,
      settings: {
        locked: {
          active: false,
          password: "",
        },
      },
    },
  });

  const { data: movements, refetch: refetchMovement } = useQuery({
    queryKey: ["movement"],
    enabled: budget.id !== undefined,
    queryFn: () =>
      supabase
        .from("movement")
        .select()
        .eq("budget_id", budget.id)
        .order("created_at", { ascending: false })
        .then((e) => e.data) as Promise<Array<Movement>>,
    initialData: [],
  });

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [alterBudget, setAlterBudget] = useState(true);
  const [locked, setLocked] = useState(true);
  const [isLockModalOpen, setLockModalOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [lockPassword, setLockPassword] = useState("");

  const payload = { amount, description };

  const reset = () => {
    setAmount(0);
    setDescription("");
  };

  const handleSpend = async () => {
    const body = {
      amount: budget.amount - payload.amount,
      expense: budget.expense + payload.amount,
    };
    reset();
    if (alterBudget) {
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
    }
    await supabase.from("movement").insert({
      ...payload,
      type: "expense",
      budget_id: budget.id,
    });
    refetchMovement();
    reset();
  };

  const handleIncome = async () => {
    const body = {
      amount: budget.amount + payload.amount,
      income: budget.income + payload.amount,
    };
    reset();
    if (alterBudget) {
      await supabase.from("budget").update(body).eq("id", budget.id);
      refetchBudget();
    }
    await supabase.from("movement").insert({
      ...payload,
      type: "income",
      budget_id: budget.id,
    });
    refetchMovement();
  };

  const handleUnlockView = async () => {
    if (lockPassword === budget.settings.locked.password) {
      setLocked(false);
      setLockPassword("");
      setLockModalOpen(false);
    } else {
      alert("invalid password");
    }
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigation.push("/login");
  };

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

    const expenseSeries = chart.addAreaSeries({
      lineColor: colors.red[400],
      topColor: colors.red[400],
      bottomColor: "rgba(242, 176, 95, 0.1)",
      lineType: LineType.Curved,
      title: "expense",
    });
    expenseSeries.setData(expenseDataSet);

    const incomeSeries = chart.addAreaSeries({
      lineColor: colors.blue[400],
      topColor: colors.blue[400],
      bottomColor: "rgba(242, 176, 95, 0.1)",
      lineType: LineType.Curved,
      title: "income",
    });
    incomeSeries.setData(incomeDataSet);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [expenseDataSet, incomeDataSet]);

  return (
    <div className="p-3 container mx-auto">
      <div className="flex justify-between mb-5 md:mb-10 mt-2 md:mt-5">
        <h1 className="text-lg font-semibold">Board expense tracker</h1>
        <Button size="sm" color="primary" variant="flat" onClick={handleLogOut}>
          Log out
        </Button>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2  gap-6">
          <Card>
            <CardBody className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <Input
                    label="Amount"
                    placeholder="S/00.00"
                    type="number"
                    isDisabled={locked}
                    value={String(amount)}
                    onValueChange={(e) => setAmount(Number(e))}
                  />
                  {!locked && (
                    <Slider
                      minValue={0}
                      maxValue={budget.amount}
                      aria-label="range of amount typed"
                      size="sm"
                      value={amount}
                      onChange={(value) => setAmount(value as number)}
                      color={changeLimitColor(amount, budget.amount)}
                      className="mt-3"
                      marks={[
                        {
                          value: budget.amount * 0.1,
                          label: "10%",
                        },
                        {
                          value: budget.amount * 0.5,
                          label: "30%",
                        },
                        {
                          value: budget.amount * 0.8,
                          label: "60%",
                        },
                      ]}
                    />
                  )}
                </div>
                <Input
                  isDisabled={locked}
                  label="Description"
                  placeholder="What the money will be used for"
                  value={description}
                  onValueChange={setDescription}
                />
              </div>
              <div className="flex gap-6">
                {locked ? (
                  <Switch
                    isSelected={isLockModalOpen}
                    onValueChange={(lockedValue) => {
                      setLockModalOpen(lockedValue);
                    }}
                    size="sm"
                  >
                    <span className="text-gray-400">Show money</span>
                  </Switch>
                ) : (
                  <Checkbox
                    color="primary"
                    isSelected
                    onClick={() => setLocked(true)}
                  >
                    <span className="text-gray-400">Hide money</span>
                  </Checkbox>
                )}
                <Switch
                  size="sm"
                  isDisabled={locked}
                  isSelected={alterBudget}
                  onValueChange={setAlterBudget}
                >
                  <span className="text-gray-400">Alter own budget</span>
                </Switch>
              </div>
              <div className="grid grid-cols-2 md:flex gap-6">
                <Button
                  color="danger"
                  onClick={handleSpend}
                  isDisabled={amount >= Math.floor(budget.amount) || locked}
                >
                  Spend
                </Button>
                <Button
                  color="primary"
                  onClick={handleIncome}
                  isDisabled={locked}
                >
                  Income
                </Button>
              </div>
            </CardBody>
          </Card>
          <div className={`relative ${locked ? "blur-sm" : ""}`}>
            <div ref={chartContainerRef} data-area="graphic" />
            {locked && (
              <div className="absolute w-full h-full top-0 left-0 z-20"></div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-6 font-medium">
          <Card>
            <CardBody>
              Budget:
              <span className="text-green-400">
                <LockContent locked={locked}>{budget.amount}</LockContent>
              </span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Expense:
              <span className="text-red-400">
                <LockContent locked={locked}>{budget.expense}</LockContent>
              </span>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              Income:
              <span className="text-blue-400">
                <LockContent locked={locked}>{budget.income}</LockContent>
              </span>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <Table aria-label="movements">
              <TableHeader>
                <TableColumn>Amount</TableColumn>
                <TableColumn>Type</TableColumn>
                <TableColumn>Description</TableColumn>
                <TableColumn>Date</TableColumn>
              </TableHeader>
              <TableBody>
                {movements.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <LockContent locked={locked}>
                        {movement.amount}
                      </LockContent>
                    </TableCell>
                    <TableCell>
                      {movement.type === MovementType.EXPENSE ? (
                        <TrendingDown />
                      ) : (
                        <TrendingUp />
                      )}
                    </TableCell>
                    <TableCell>
                      <LockContent
                        locked={locked}
                        lockedContent="**************"
                      >
                        {movement.description}
                      </LockContent>
                    </TableCell>
                    <TableCell>
                      {dayjs(movement.created_at).format("DD/MM/YYYY hh:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal
          isOpen={isLockModalOpen}
          size="sm"
          onOpenChange={setLockModalOpen}
        >
          <ModalContent>
            <div className="space-y-6 p-2">
              <Input
                label="Password to view money"
                placeholder="type your own password"
                type="password"
                value={lockPassword}
                onValueChange={setLockPassword}
              />
              <Button fullWidth color="success" onClick={handleUnlockView}>
                Unlock
              </Button>
            </div>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

function changeLimitColor(amount: number, maxAmount: number) {
  const percentage = (amount / maxAmount) * 100;
  if (percentage > 60) return "danger";
  if (percentage > 30) return "warning";
  if (percentage > 10) return "success";
  return "success";
}
