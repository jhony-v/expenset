import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const currency = url.searchParams.get("currency")?.trim();
  const token = url.searchParams.get("token")?.trim();
  const secret = Deno.env.get("GET_EXCHANGE_RATE_TOKEN")?.trim();

  if (token !== secret) {
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
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});
