import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

export async function middleware(req: Request) {
  // Get the user's IP address
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Check the rate limit
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

// Apply middleware to all API routes
export const config = {
  matcher: [
    "/api/improvement",
    "/api/material",
    "/api/question_generation",
    "/api/scoring",
  ],
};
