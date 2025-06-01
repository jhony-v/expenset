import { NextResponse } from "next/server";
import { createClient } from "redis";

let redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL,
    });
    await redis.connect();
  }
  return redis;
}

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const redis = await getRedis();

  try {
    const value = await redis.get(key);
    return NextResponse.json({ value: JSON.parse(value || "null") });
  } catch (error) {
    console.error("Redis GET error:", error);
    return NextResponse.json(
      { error: "Error fetching from Redis" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { key, value } = await req.json();

  if (!key || !value) {
    return new Response("Missing key or value", { status: 400 });
  }

  const redis = await getRedis();

  try {
    await redis.set(key, value, {
      expiration: { value: 60 * 5, type: "EX" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis SET error:", error);
    return NextResponse.json(
      { error: "Error setting Redis value" },
      { status: 500 }
    );
  }
}
