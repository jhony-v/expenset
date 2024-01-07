"use client";

import { useChat } from "ai/react";
import { Avatar, Button, Progress, ScrollShadow } from "@nextui-org/react";
import Link from "next/link";
import Send from "../shared/icons/Send";
import Logo from "../shared/components/Logo";
import Bot from "../shared/icons/Bot";
import Activity from "../shared/icons/Activity";
import ArrowLeft from "../shared/icons/ArrowLeft";

export default function MyComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onError() {
      console.log("error");
    },
  });

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto md:w-unit-8xl h-screen flex flex-col overflow-hidden ">
      <header className="p-2 flex-none flex items-center gap-6">
        <Link href="/">
          <ArrowLeft />
        </Link>
        <Logo />
      </header>
      <main className="flex-1 flex flex-col w-full gap-3 overflow-hidden">
        <ScrollShadow className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="mt-unit-5xl px-5">
              <h1 className="text-3xl text-center font-medium">
                Let's get start by analyzing your incomes and expenses
              </h1>
              <Progress
                size="sm"
                isIndeterminate
                color="success"
                className="my-unit-lg mx-auto w-1/2"
                aria-label="waiting"
              />
              <p className="text-zinc-400 text-center mt-unit-lg mx-auto">
                This is your bot assistant to analize and give you suggestions.
              </p>
            </div>
          ) : (
            <ul className="px-4 py-5 space-y-4">
              {messages.map((m, index) => {
                const isUser = m.role === "user";
                return (
                  <li
                    key={index}
                    className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div>
                      <Avatar
                        size="sm"
                        icon={isUser ? <Activity /> : <Bot />}
                      />
                    </div>
                    <div
                      className={`max-w-[60%] md:max-w-80 ${
                        !isUser ? "bg-zinc-700 rounded-xl p-3" : ""
                      }`}
                    >
                      {m.content}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollShadow>
        <footer className="flex-none">
          {!isEmpty && (
            <Progress isIndeterminate size="sm" className="mb-2 px-4" />
          )}
          <form
            onSubmit={handleSubmit}
            className="m-2 flex rounded-3xl bg-zinc-700 p-2"
          >
            <input
              name="ask"
              placeholder="Ask for your financial account..."
              value={input}
              onChange={handleInputChange}
              className="flex-1 bg-transparent outline-none"
              spellCheck="false"
              autoComplete="off"
            />
            <Button
              variant="shadow"
              isIconOnly
              color="primary"
              type="submit"
              radius="full"
            >
              <Send />
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
}
