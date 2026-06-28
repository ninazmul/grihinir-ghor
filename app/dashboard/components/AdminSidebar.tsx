"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  LayoutDashboard,
  ImageIcon,
  ShieldCheck,
  Settings,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator"],
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: ShoppingBag,
    roles: ["admin", "moderator"],
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: Truck,
    roles: ["admin", "moderator"],
  },
  {
    title: "Admins",
    url: "/dashboard/admins",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

const AdminSidebar = ({ role }: { role?: string }) => {
  const currentPath = usePathname();
  const [settings, setSettings] = useState<ISettingSafe | null>(null);

  useEffect(() => {
    (async () => {
      const setting = await getSetting();
      setSettings(setting);
    })();
  }, []);

  return (
    <Sidebar
      className="bg-white text-primary font-semibold shadow-md"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          {/* Logo + Name like Header */}
          <SidebarGroupLabel>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-200"
            >
              <div className="relative w-10 h-10 rounded-md overflow-hidden">
                <Image
                  src={settings?.logo || "/assets/images/logo.png"}
                  fill
                  className="object-contain"
                  alt={settings?.name || "Logo"}
                  priority
                />
              </div>
              <span className="text-lg font-bold text-primary">
                {settings?.name || "Grihinir Ghor"}
              </span>
            </Link>
          </SidebarGroupLabel>

          {/* Menu */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarItems
                .filter((item) => {
                  return item.roles.includes(role?.toLowerCase() || "");
                })
                .map((item) => {
                  const isActive =
                    item.url === "/dashboard"
                      ? currentPath === item.url
                      : currentPath === item.url ||
                        currentPath.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "hover:bg-primary/10 hover:text-primary"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
