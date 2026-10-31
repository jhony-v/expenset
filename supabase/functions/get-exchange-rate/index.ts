import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const currency = url.searchParams.get("currency")?.trim();
  const token = url.searchParams.get("token")?.trim();
  const secret = Deno.env.get("GET_EXCHANGE_RATE_TOKEN")?.trim();
  console.log("[exchange] request currency:", currency);

  if (token !== secret) {
    console.log("[exchange] invalid token");
    return new Response(
      JSON.stringify({
        error: "Invalid token",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
  if (!currency || (currency !== "PEN" && currency !== "USD")) {
    console.log("[exchange] invalid currency:", currency);
    return new Response(
      JSON.stringify({
        error: "Invalid currency. Please use PEN or USD.",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/latest/${currency}`,
    {
      headers: {
        Authorization: `Bearer ${Deno.env.get("EXCHANGE_RATE_API_KEY")}`,
      },
    }
  );
  const data = await response.json();
  console.log("[exchange] api status:", response.status, "| result:", data.result);
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});
