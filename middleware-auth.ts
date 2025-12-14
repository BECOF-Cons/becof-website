import { auth } from "@/auth";
import { NextResponse } from "next/server";

export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
