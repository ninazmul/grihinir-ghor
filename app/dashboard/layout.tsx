export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireDashboardAccess } from "@/lib/auth/admin";
import AdminSidebar from "./components/AdminSidebar";
import { cookies } from "next/headers";
import { Show, UserButton } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  const { role } = await requireDashboardAccess("/");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar role={role} />
      <Toaster />
      <main className="flex-1 h-screen mx-auto overflow-y-auto">
        <div className="flex justify-between items-center p-4 w-full border-b text-white bg-primary">
          <SidebarTrigger />
          <Show when="signed-in">
            <UserButton afterSwitchSessionUrl="/" />
          </Show>
        </div>
        <div className="p-2">{children}</div>
      </main>
    </SidebarProvider>
  );
}
