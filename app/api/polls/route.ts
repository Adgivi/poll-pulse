import { NextResponse } from "next/server";
import { createPollFromInput } from "@/lib/poll-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const poll = await createPollFromInput(payload);

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message,
        },
      },
      { status: 400 },
    );
  }
}
