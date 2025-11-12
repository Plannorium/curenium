import { NextRequest } from "next/server";
import { getSession } from "./session";

export enum ROLE {
  ADMIN = "admin",
  PRACTITIONER = "practitioner",
  RECEPTIONIST = "receptionist",
}

export async function requireRole(req: NextRequest, roles: ROLE[] = []) {
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, status: 401, session: null };
  }

  if (roles.length > 0 && !roles.includes(session.user.role as ROLE)) {
    return { ok: false, status: 403, session };
  }

  return { ok: true, status: 200, session };
}