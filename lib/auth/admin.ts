import { getAdminRole } from "@/lib/actions/admin.actions";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type DashboardRole = "Admin" | "Moderator";

type AdminAccess = {
  userId: string;
  email: string;
  role: DashboardRole | null;
};

function normalizeDashboardRole(role: string | null): DashboardRole | null {
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole === "admin") {
    return "Admin";
  }

  if (normalizedRole === "moderator") {
    return "Moderator";
  }

  return null;
}

export async function getCurrentAdminAccess(): Promise<AdminAccess | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const email =
    user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    )?.emailAddress || "";

  const role = normalizeDashboardRole(await getAdminRole(email));

  return {
    userId,
    email,
    role,
  };
}

export async function requireDashboardAccess(redirectTo = "/") {
  const access = await getCurrentAdminAccess();

  if (!access?.role) {
    redirect(redirectTo);
  }

  return access as AdminAccess & { role: DashboardRole };
}

export async function requireDashboardRole(
  allowedRoles: DashboardRole[],
  redirectTo = "/dashboard",
) {
  const access = await requireDashboardAccess("/");

  if (!allowedRoles.includes(access.role)) {
    redirect(redirectTo);
  }

  return access;
}
