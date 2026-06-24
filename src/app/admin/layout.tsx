"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Store, LogOut, Menu, X, Image as ImageIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { orderService } from "@/services/order.service";
import { userService } from "@/services/user.service";
import { productKeys } from "@/hooks/use-products";
import { categoryKeys } from "@/hooks/use-categories";
import { orderKeys } from "@/hooks/use-orders";

const navItems = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products",   label: "Products",   icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders",     label: "Orders",     icon: ShoppingBag },
  { href: "/admin/users",      label: "Users",      icon: Users },
  { href: "/admin/banners",    label: "Banners",    icon: ImageIcon },
];

function NavLink({ item, pathname, onClick, onPrefetch }: {
  item: typeof navItems[0];
  pathname: string;
  onClick?: () => void;
  onPrefetch?: () => void;
}) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      onMouseEnter={onPrefetch}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-white text-stone-800 shadow-sm"
          : "text-stone-400 hover:text-white hover:bg-white/10"
      )}
    >
      <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-stone-700" : "")} />
      {item.label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const qc = useQueryClient();

  const prefetchMap: Record<string, () => void> = {
    "/admin/products":   () => qc.prefetchQuery({ queryKey: productKeys.admin(),  queryFn: productService.getAdminProducts,  staleTime: 5 * 60_000 }),
    "/admin/categories": () => qc.prefetchQuery({ queryKey: categoryKeys.admin(), queryFn: categoryService.getAllCategories, staleTime: 5 * 60_000 }),
    "/admin/orders":     () => qc.prefetchQuery({ queryKey: orderKeys.admin(),    queryFn: orderService.getAllOrders,        staleTime: 2 * 60_000 }),
    "/admin/users":      () => qc.prefetchQuery({ queryKey: ["admin-users"],      queryFn: userService.getAllUsers, staleTime: 2 * 60_000 }),
  };

  const handleLogout = async () => {
    await authService.signOut();
    clearAuth();
    toast.success("Logged out");
    router.push("/auth/login");
  };

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/admin" onClick={onNav} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-none">ShopElite</p>
            <p className="text-[10px] text-stone-400 mt-0.5 uppercase tracking-wider">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav label */}
      <p className="px-6 text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Menu</p>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNav} onPrefetch={prefetchMap[item.href]} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 pt-4 border-t border-white/10 space-y-0.5 mt-4">
        <Link
          href="/"
          onClick={onNav}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Store className="h-4 w-4" />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f5f3f0]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-30 bg-stone-900">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-stone-900 flex flex-col transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-bold text-white">Admin Panel</span>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded text-stone-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onNav={() => setMobileOpen(false)} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:ml-60">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-stone-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-base flex-1 text-stone-800">ShopElite Admin</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Page header bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200">
          <p className="text-sm text-stone-400">
            {navItems.find(n => n.href === pathname)?.label ?? "Admin"}
          </p>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" />
              View Store
            </Link>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
