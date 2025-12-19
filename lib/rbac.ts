import { NextRequest } from "next/server";
import { getSession } from "./session";

export enum ROLE {
  ADMIN = "admin",
  DOCTOR = "doctor",
  NURSE = "nurse",
  MATRON_NURSE = "matron_nurse",
  MANAGER = "manager",
  STAFF = "staff",
  LABTECH = "labtech",
  RECEPTIONIST = "reception",
  PRACTITIONER = "practitioner", // Legacy
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

// Permission checking functions
export async function canAssignRoles(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

export async function canManageUsers(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

export async function canAccessPatientData(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.DOCTOR, ROLE.NURSE, ROLE.MATRON_NURSE, ROLE.MANAGER, ROLE.STAFF, ROLE.LABTECH].includes(role);
}

export async function canAdministerMedications(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.NURSE, ROLE.MATRON_NURSE, ROLE.DOCTOR].includes(role);
}

export async function canManageTasks(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.DOCTOR, ROLE.NURSE, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

export async function canDelegateTasks(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.DOCTOR, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

export async function canViewAllPatients(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.DOCTOR, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

export async function canEditPatientAssignments(req: NextRequest): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const role = session.user.role as ROLE;
  return [ROLE.ADMIN, ROLE.DOCTOR, ROLE.MATRON_NURSE, ROLE.MANAGER].includes(role);
}

// Role hierarchy helper
export function getRoleHierarchy(role: ROLE): number {
  const hierarchy = {
    [ROLE.ADMIN]: 10,
    [ROLE.MATRON_NURSE]: 8,
    [ROLE.MANAGER]: 7,
    [ROLE.DOCTOR]: 6,
    [ROLE.NURSE]: 5,
    [ROLE.STAFF]: 4,
    [ROLE.LABTECH]: 3,
    [ROLE.RECEPTIONIST]: 2,
    [ROLE.PRACTITIONER]: 1,
  };
  return hierarchy[role] || 0;
}

export function canAssignRole(assignerRole: ROLE, targetRole: ROLE): boolean {
  const assignerLevel = getRoleHierarchy(assignerRole);
  const targetLevel = getRoleHierarchy(targetRole);
  return assignerLevel > targetLevel;
}