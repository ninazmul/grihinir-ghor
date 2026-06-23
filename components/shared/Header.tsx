"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import { LogIn, Shield } from "lucide-react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { getSetting, isAdmin } from "@/lib/actions";

interface HeaderProps {
  openSearch: () => void;
}

export default function Header({ openSearch }: HeaderProps) {
  const { user } = useUser();

  const [adminStatus, setAdminStatus] = useState(false);
  const [settings, setSettings] = useState<ISettingSafe | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting();
        setSettings(setting);
      } catch (err) {
        console.error("Settings load failed", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setAdminStatus(false);
      return;
    }
    const fetchUserData = async () => {
      try {
        const email =
          user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId,
          )?.emailAddress || "";
        const admin = await isAdmin(email);
        setAdminStatus(admin);
      } catch {
        setAdminStatus(false);
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <header className="shadow-lg">
      {/* Top Layer: Logo + Name */}
      <div className="bg-white border-b border-gray-200">
        <Link
          href="/"
          className="max-w-7xl mx-auto flex items-center gap-2 px-6 py-3"
        >
          <div className="relative w-12 md:w-14 h-12 md:h-14 rounded-md overflow-hidden">
            <Image
              src={settings?.logo || "/assets/images/logo.png"}
              fill
              className="object-contain"
              alt={settings?.name || "Logo"}
              priority
            />
          </div>
          <span className="text-2xl md:text-4xl font-bold tracking-wide text-primary">
            {settings?.name || "Virtual School"}
          </span>
        </Link>
      </div>

      {/* Bottom Layer: Navigation, Search, Auth */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-2">
          {/* Search */}
          <div className="hidden md:flex flex-grow max-w-md">
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-4 py-2 w-full rounded-full border border-white/40 text-white/80 hover:border-white hover:text-white transition"
            >
              <FaMagnifyingGlass />
              <span className="text-sm">Search courses...</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex flex-grow justify-center">
            <NavItems />
          </nav>

          {/* Auth + Mobile */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Show when="signed-in">
              {adminStatus && (
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-primary hover:bg-primary hover:text-white rounded-full font-semibold"
                >
                  <Link
                    href="/dashboard"
                    target="_blank"
                    className="flex items-center gap-1"
                  >
                    <Shield size={16} />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </Button>
              )}
              <UserButton />
            </Show>

            <Show when="signed-out">
              <Button
                asChild
                size="sm"
                className="bg-white text-primary hover:bg-primary hover:text-white rounded-full font-semibold"
              >
                <Link href="/sign-in" className="flex items-center gap-1">
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
              </Button>
            </Show>

            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
