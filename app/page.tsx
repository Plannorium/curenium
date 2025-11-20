import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import React from "react";
import type { Session } from "next-auth";
import { LandingPageClient } from "./(dashboard)/components/LandingPageClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return <LandingPageClient session={session} />;
}
