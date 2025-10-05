"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityRadialChartProps {
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
  className?: string;
}

const PriorityRadialChart = ({ activeCount, inactiveCount, totalCount, className }: PriorityRadialChartProps) => {
  const size = 200; // SVG viewBox size
  const center = size / 2;
  const radiusOuter = 80;
  const radiusMiddle = 60;
  const radiusInner = 40;

  // Colors from the image
  const activeColor = 'hsl(28 100% 70%)'; // Orange
  const inactiveColor = 'hsl(240 60% 70%)'; // Purple
  const centerColor = 'hsl(48 100% 70%)'; // Yellow

  // Position dots (example: 30 degrees for active, 210 degrees for inactive)
  const getDotPosition = (angleDegrees: number, radius: number) => {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180; // Adjust for SVG 0deg at 3 o'clock
    return {
      x: center + radius * Math.cos(angleRadians),
      y: center + radius * Math.sin(angleRadians),
    };
  };

  const activeDotPos = getDotPosition(30, radiusMiddle); // Example position for active dot
  const inactiveDotPos = getDotPosition(210, radiusOuter); // Example position for inactive dot

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[200px] max-h-[200px]">
        {/* Outer ring (Inactive) */}
        <circle cx={center} cy={center} r={radiusOuter} fill="none" stroke={inactiveColor} strokeWidth="2" opacity="0.3" />
        {/* Middle ring (Active) */}
        <circle cx={center} cy={center} r={radiusMiddle} fill="none" stroke={activeColor} strokeWidth="2" opacity="0.3" />
        {/* Inner ring (Total) - not explicitly shown as a ring in image, but implied by center */}
        {/* Center circle */}
        <circle cx={center} cy={center} r={radiusInner} fill={centerColor} opacity="0.7" />

        {/* Dots */}
        <circle cx={activeDotPos.x} cy={activeDotPos.y} r="5" fill={activeColor} />
        <circle cx={inactiveDotPos.x} cy={inactiveDotPos.y} r="5" fill={inactiveColor} />
      </svg>
    </div>
  );
};

export default PriorityRadialChart;