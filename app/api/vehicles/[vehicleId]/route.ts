import { NextResponse, type NextRequest } from "next/server";

/** Placeholder until this route is implemented. */
export function GET(
  _request: NextRequest,
  _context: { params: Promise<{ vehicleId: string }> },
) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
