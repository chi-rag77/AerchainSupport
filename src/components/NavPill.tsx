"use client";
import React from "react";
import { Home, Layers, BarChart2, Users, Activity, Brain } from "lucide-react";
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
      <div className="relative inline-flex items-center rounded-full p-1 bg-gray-100/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 shadow-inner">
        {items.map((it) => {
          const isActive = activePath === it.path;
          const IconComponent = it.icon;
          
          return (
            <Link
              key={it.path}
              to={it.path}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 mx-0.5 transition-all duration-300 group",
                isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Magnetic Hover Glow */}
              <div className="absolute inset-0 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300" />

              <span className="relative z-10 flex items-center gap-2">
                <span className={cn(
                  "h-6 w-6 inline-flex items-center justify-center rounded-full transition-all duration-300",
                  isActive ? "bg-white/20 text-white" : "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm group-hover:scale-110"
                )}>
                  <IconComponent className={cn(
                    "h-3.5 w-3.5",
                    it.label === 'Pulse' && !isActive && "animate-pulse" // Heartbeat for Pulse
                  )} />
                </span>
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-widest transition-all",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
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