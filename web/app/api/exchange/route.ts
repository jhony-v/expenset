import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = cookies();

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return NextResponse.json(
      {
        error: true,
      },
      {
        status: 401,
        statusText: "Unauthorized",
      }
    );
  }

  const apiUrl = `${process.env.SUPABASE_FUNCTION_EXCHANGE_API_URL}?currency=PEN&token=${process.env.SUPABASE_FUNCTION_EXCHANGE_API_TOKEN}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json({
        error: true,
        message: "Failed to fetch exchange rate: " + response.statusText,
      });
    }
    const result = await response.json();
    const { conversion_rates } = result;
    const PEN = 1;
    const USD = parseFloat((PEN / conversion_rates.USD).toFixed(2));
    return NextResponse.json({
      PEN,
      USD,
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json({
      error: true,
      message: "Error fetching exchange rate",
    });
  }
}
