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
      <div className="relative inline-flex items-center rounded-full p-1 bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-inner overflow-hidden">
        
        {/* Global Energy Light (Entire Container) */}
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-0 pointer-events-none"
        />

        {items.map((it) => {
          const isActive = activePath === it.path;
          const IconComponent = it.icon;
          
          return (
            <Link
              key={it.path}
              to={it.path}
              className={cn(
                "relative z-10 flex items-center gap-3 rounded-full px-5 py-2.5 mx-0.5 transition-all duration-300 group",
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
                  isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
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