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
      {/* Outer Wrapper for the Border Beam Effect */}
      <div className="relative p-[1.5px] overflow-hidden rounded-full group">
        
        {/* The "Energy Light" Beam - Rotating Conic Gradient */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-250%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#5850EC_320deg,#FFFFFF_360deg)] opacity-100"
        />

        {/* Inner Container (Covers the center of the gradient to leave only the outline) */}
        <div className="relative z-10 inline-flex items-center rounded-full p-1 bg-white dark:bg-gray-950 shadow-inner">
          {items.map((it) => {
            const isActive = activePath === it.path;
            const IconComponent = it.icon;
            
            return (
              <Link
                key={it.path}
                to={it.path}
                className={cn(
                  "relative z-10 flex items-center gap-3 rounded-full px-5 py-2.5 mx-0.5 transition-all duration-300 group/item",
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-[#5850EC] rounded-full shadow-lg shadow-indigo-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-3">
                  <span className={cn(
                    "h-7 w-7 inline-flex items-center justify-center rounded-full transition-all duration-300 shadow-sm",
                    isActive ? "bg-white/20 text-white" : "bg-white dark:bg-gray-800 text-[#5850EC]"
                  )}>
                    <IconComponent className={cn(
                      "h-4 w-4",
                      it.label === 'Pulse' && !isActive && "animate-pulse"
                    )} />
                  </span>
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive ? "opacity-100" : "opacity-80 group-hover/item:opacity-100"
                  )}>
                    {it.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}