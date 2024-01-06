import createMiddleware from "next-intl/middleware";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";

const middlewareI18n = createMiddleware({
  locales: ["en", "de"],
  defaultLocale: "en",
});

export default async function middleware(req: NextRequest) {
  const res = middlewareI18n(req);
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/((?!api|_next|.*\\..*).*)",
  ],
};
