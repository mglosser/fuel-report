import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey } from "./lib/verify-api-key";

/**
 * In-app browser requests (same origin) may call /api without a Bearer key.
 * External / programmatic clients must send Authorization: Bearer <api-key>.
 */
function isOwnClientRequest(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-site") === "same-origin") {
    return true;
  }
  const expectedOrigin = request.nextUrl.origin;

  const origin = request.headers.get("origin");
  if (origin != null && origin === expectedOrigin) {
    return true;
  }

  const referer = request.headers.get("referer");
  if (referer != null) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  return false;
}

export async function proxy(request: NextRequest) {
  if (isOwnClientRequest(request)) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");

  let token: string | undefined;
  if (authorization) {
    const m = /^Bearer\s+(.+)/i.exec(authorization);
    token = (m?.[1] ?? authorization.split(/\s+/)[1])?.trim();
  }

  if (!token?.length) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validApiKey = await verifyApiKey(token);
  if (!validApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/api/((?!create-api-key(?:/|$)).*)",
      locale: false,
    },
  ],
};
