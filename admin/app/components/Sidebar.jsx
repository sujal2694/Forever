"use client";

import React, { useContext, useRef, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  List,
  Package,
  SquarePlus,
  User,
} from "lucide-react";
import { Context } from "../context/Context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const subscribeToCollapsePreference = (onStoreChange) => {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("sidebarcollapsechange", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("sidebarcollapsechange", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

const getCollapseSnapshot = () =>
  typeof window === "undefined"
    ? false
    : localStorage.getItem("admin-sidebar-collapsed") === "true";

const getServerCollapseSnapshot = () => false;

const Sidebar = () => {
  const { link, setLink } = useContext(Context);
  const collapsed = useSyncExternalStore(
    subscribeToCollapsePreference,
    getCollapseSnapshot,
    getServerCollapseSnapshot,
  );
  const buttonRefs = useRef([]);
  const navigation = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["add", SquarePlus, "Add Product"],
    ["product-list", List, "Product List"],
    ["orders", Package, "Orders"],
    ["profile", User, "Profile"],
  ];

  const toggleCollapsed = () => {
    const next = !collapsed;
    localStorage.setItem("admin-sidebar-collapsed", String(next));
    window.dispatchEvent(new Event("sidebarcollapsechange"));
  };

  const handleNavigationKeyDown = (event, index) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (index + direction + navigation.length) % navigation.length;
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <aside
      className={`flex min-h-[calc(100vh-65px)] shrink-0 flex-col border-r border-gray-200 bg-white/70 transition-[width] duration-200 ${collapsed ? "w-16 sm:w-20 lg:w-20" : "w-16 sm:w-20 lg:w-56"}`}
    >
      <nav
        aria-label="Admin navigation"
        className="mt-6 flex w-full flex-1 flex-col items-start justify-start gap-2 px-2 sm:px-3"
      >
        <TooltipProvider delayDuration={200}>
          {navigation.map(([value, Icon, label], index) => {
            const isActive = link === value;
            const tooltipHiddenOnDesktop = !collapsed ? "lg:hidden" : "";

            return (
              <Tooltip key={value}>
                <TooltipTrigger
                  render={
                    <button
                      ref={(element) => {
                        buttonRefs.current[index] = element;
                      }}
                      type="button"
                      onClick={() => setLink(value)}
                      onKeyDown={(event) =>
                        handleNavigationKeyDown(event, index)
                      }
                      aria-current={isActive ? "page" : undefined}
                      aria-label={label}
                      title={label}
                      className={`group relative flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-lg px-2 py-2.5 text-sm outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-black/20 lg:justify-start lg:px-4 ${isActive ? "bg-black/5 font-semibold text-black shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-r-full bg-[var(--sidebar-active-accent)] transition-all duration-200 ${isActive ? "w-1 translate-x-0 opacity-100" : "w-0 -translate-x-1 opacity-0"}`}
                        aria-hidden="true"
                      />
                      <Icon
                        className={`size-5 shrink-0 transition-transform duration-150 ${isActive ? "stroke-[2.5]" : "stroke-2 group-hover:scale-105"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`hidden truncate transition-all duration-200 lg:block ${collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-40 translate-x-0 opacity-100"}`}
                      >
                        {label}
                      </span>
                    </button>
                  }
                />
                <TooltipContent side="right" className={tooltipHiddenOnDesktop}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="hidden p-2 lg:block">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          {collapsed ? (
            <ChevronRight className="size-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-5" aria-hidden="true" />
          )}
          <span
            className={`truncate text-sm transition-all duration-200 ${collapsed ? "max-w-0 opacity-0" : "max-w-32 opacity-100"}`}
          >
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
