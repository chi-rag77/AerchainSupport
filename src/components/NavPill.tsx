"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
    <nav aria-label="Primary" className="p-1">
      <div className="relative inline-flex items-center rounded-full p-1 bg-white dark:bg-gray-950 border border-border shadow-sm">
        {items.map((it) => {
          const isActive = activePath === it.path;
          const IconComponent = it.icon;
          
          return (
            <Link
              key={it.path}
              to={it.path}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 mx-0.5 transition-all duration-300 group/item",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-[#5850EC] rounded-full shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <IconComponent className={cn(
                  "h-3.5 w-3.5",
                  it.label === 'Pulse' && !isActive && "animate-pulse"
                )} />
                <span className={cn(
                  "text-[13px] font-medium transition-all",
                  isActive ? "opacity-100" : "opacity-80 group-hover/item:opacity-100"
                )}>
                  {it.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}