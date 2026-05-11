import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export async function GET() {
  try {
    const apiKeys = await prisma.apiKeys.findMany({
      orderBy: {
        expires: "desc",
      },
    });

    return NextResponse.json({
      data: apiKeys.map((apiKey) => ({
        id: apiKey.id,
        createdBy: apiKey.createdBy,
        expires: Number(apiKey.expires),
        active: apiKey.active,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to get API keys" }, { status: 500 });
  }
}

export async function POST (request: NextRequest) {
  const { name } = await request.json();

  const apiKey = 'fr_' + crypto.randomBytes(32).toString("hex");

  const hashedApiKey = crypto.createHash("sha256").update(apiKey).digest("hex");

  const tenYearsFromNow = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);

  try {

    const apiKeyRecord = await prisma.apiKeys.create({
      data: {
        id: hashedApiKey,
        createdBy: name,
        expires: tenYearsFromNow.getTime(),
        active: true,
      },
    });

    return NextResponse.json({
      data: {
        apiKey: apiKey,
        createdBy: apiKeyRecord.createdBy,
        expires: Number(apiKeyRecord.expires),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}