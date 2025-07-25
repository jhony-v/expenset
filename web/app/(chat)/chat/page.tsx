"use client";

import { useChat } from "@ai-sdk/react";
import { Avatar, Button, Progress, ScrollShadow } from "@nextui-org/react";
import Logo from "@/app/shared/components/Logo";
import Back from "@/app/shared/components/Back";
import { LucideActivity, LucideBot, LucideSend } from "lucide-react";

export default function MyComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onError(e) {
      console.log("error", e);
    },
  });

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto md:w-unit-8xl h-dvh flex flex-col overflow-hidden">
      <header className="p-2 flex-none flex items-center gap-6">
        <Back />
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
                        icon={
                          isUser ? (
                            <LucideActivity className="text-danger-400" />
                          ) : (
                            <LucideBot className="text-warning-400" />
                          )
                        }
                      />
                    </div>
                    <div
                      className={`max-w-[60%] md:max-w-80 ${
                        !isUser ? "bg-zinc-800 rounded-xl p-3" : ""
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
          <form
            onSubmit={handleSubmit}
            className="m-4 flex rounded-3xl bg-zinc-800 p-2"
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
              <LucideSend />
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
}
