import { Button, Input } from "@nextui-org/react";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Login() {
  const onLogin = async (formData: FormData) => {
    "use server";
    const email = formData.get("email");
    const password = formData.get("password");
    const supabase = createServerActionClient({ cookies });
    if (email !== null && password !== null) {
      const { data } = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
      });
      if (data.session) {
        redirect("/");
      }
    }
  };

  return (
    <div className="md:w-80 mx-auto py-20">
      <form action={onLogin} className="gap-8 flex flex-col">
        <h1 className="text-2xl font-bold">Log in</h1>
        <Input placeholder="email" name="email" label="Email" />
        <Input placeholder="password" name="password" label="Password" />
        <Button type="submit" color="primary">
          Sign in
        </Button>
      </form>
    </div>
  );
}
