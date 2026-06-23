"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { getSetting } from "@/lib/actions/setting.actions";
import NavItems from "./NavItems";
import Link from "next/link";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ISettingSafe | null>(null);

  useEffect(() => {
    (async () => {
      const setting = await getSetting();
      setSettings(setting);
    })();
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <nav className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger */}
        <SheetTrigger
          aria-label="Open navigation menu"
          className="align-middle p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Menu
            size={32}
            className="text-white hover:text-primary transition-colors"
          />
        </SheetTrigger>

        {/* Drawer Content */}
        <SheetContent
          side="right"
          className="flex flex-col gap-8 bg-white text-primary w-11/12 shadow-xl rounded-l-lg"
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={handleClose}
            className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition rounded-md"
          >
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={settings?.logo || "/assets/images/logo.png"}
                fill
                className="object-contain"
                alt={settings?.name || "Logo"}
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-wide text-primary">
              {settings?.name || "SJPV School"}
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex flex-col gap-4 px-4">
            <NavItems onItemSelected={handleClose} />
          </div>

          {/* Footer */}
          <div className="mt-auto px-4 py-6 text-center text-xs text-primary/70 border-t border-gray-200">
            © {new Date().getFullYear()} {settings?.name || "Virtual School"}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
