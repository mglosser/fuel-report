import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

function parseDriverId(raw: unknown): number | null {
  const id =
    typeof raw === "number"
      ? raw
      : Number.parseInt(String(raw ?? "").trim(), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function DELETE(request: NextRequest) {
  const { id: rawId } = await request.json();
  const id = parseDriverId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const driver = await prisma.driver.delete({
      where: { id },
    });
    return NextResponse.json(driver);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to delete driver: " + (err as Error).message },
      { status: 500 },
    );
  }
}
