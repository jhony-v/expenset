"use client";

import { useChat } from "ai/react";
import Logo from "../shared/components/Logo";
import { Avatar, Button, ScrollShadow, Textarea } from "@nextui-org/react";
import Link from "next/link";

export default function MyComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "chat/callback",
    onError() {
      console.log("error");
    },
  });

  return (
    <div className="p-3 container mx-auto h-screen flex flex-col">
      <header className="flex-shrink-0 flex items-center">
        <Logo />
        <div className="flex gap-2 ml-auto items-center">
          <Link href="/">
            <Button size="sm" variant="flat">
              Back
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col w-full gap-3">
        <section className="flex-1 my-4">
          <ScrollShadow>
            <ul>
              {messages.map((m, index) => (
                <li key={index} className="flex gap-2">
                  <div>
                    <Avatar
                      size="sm"
                      color={m.role === "user" ? "success" : "warning"}
                    />
                  </div>
                  <div>{m.content}</div>
                </li>
              ))}
            </ul>
          </ScrollShadow>
        </section>
        <footer>
          <form onSubmit={handleSubmit}>
            <Textarea
              name="ask"
              label="Say something"
              placeholder="Ask for your financial account or get suggestions..."
              value={input}
              onChange={handleInputChange}
            />
            <Button color="primary" fullWidth className="mt-2" type="submit">
              Send
            </Button>
          </form>
        </footer>
      </main>
    </div>
  );
}
