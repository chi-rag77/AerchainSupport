"use client";
import React from "react";
import { Home, Layers, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom"; // Import Link for navigation

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface NavPillProps {
  items: NavItem[];
  activePath: string;
}

export default function NavPill({ items, activePath }: NavPillProps) {
  return (
    <nav aria-label="Primary" className="p-3">
      <div
        className="relative inline-flex items-center rounded-full px-1.5 py-1 bg-[linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.12))] 
                   backdrop-blur-md bg-noise border border-white/20 shadow-glass
                   dark:bg-[linear-gradient(135deg,rgba(30,30,30,0.26),rgba(30,30,30,0.12))] dark:border-gray-700/20"
        style={{ WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}
      >
        {/* subtle top-left glossy sheen (pseudo-element style implemented here as absolute div) */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-full overflow-hidden">
          <div
            aria-hidden
            className="absolute -left-6 -top-6 h-20 w-40 rounded-full opacity-[0.06] bg-gradient-to-r from-white/40 to-transparent blur-[24px]"
            style={{ mixBlendMode: "overlay" }}
          />
          {/* optional noise texture overlay from your uploaded file */}
          <div className="absolute inset-0 opacity-20 bg-no-repeat bg-center bg-cover" style={{ backgroundImage: "url('/a7087093-d4e0-4854-8db6-d6c44cb24e88.png')" }} />
        </div>

        {items.map((it) => {
          const isActive = activePath === it.path;
          const IconComponent = it.icon;
          return (
            <Link // Using Link for navigation
              key={it.path}
              to={it.path}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 mx-1",
                "text-sm font-medium text-slate-800 hover:text-slate-900",
                "dark:text-slate-200 dark:hover:text-white",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300",
                "transition-transform duration-180 ease-out",
                "hover:-translate-y-0.5 active:scale-95"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* active indicator: a colorful filled pill behind active item */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.08) 40%, rgba(99,102,241,0.02) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)"
                  }}
                />
              )}

              <span className="flex items-center gap-2">
                <span className={cn(
                  "h-6 w-6 inline-flex items-center justify-center rounded-full shadow-sm",
                  isActive ? "bg-indigo-500 text-white" : "bg-white/60 text-indigo-600 dark:bg-gray-700/60 dark:text-indigo-300"
                )}>
                  <IconComponent className="h-4 w-4" />
                </span>
                <span className={cn(isActive ? "font-semibold" : "font-medium")}>{it.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}