"use client";

import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const DATA = [
  {
    name: 'Invoice Sync',
    children: [
      { name: 'Timeout Error', size: 45 },
      { name: 'Auth Failure', size: 25 },
      { name: 'Data Mismatch', size: 15 },
    ],
  },
  {
    name: 'Approval Flow',
    children: [
      { name: 'Stuck Workflow', size: 35 },
      { name: 'Missing Approver', size: 20 },
    ],
  },
  {
    name: 'User Access',
    children: [
      { name: 'SSO Login', size: 30 },
      { name: 'Permission Denied', size: 15 },
    ],
  },
];

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name, depth } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? '#6366F1' : '#818CF8',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1),
          strokeOpacity: 1 / (depth + 1),
        }}
        rx={8}
        ry={8}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
          className="pointer-events-none"
        >
          {name}
        </text>
      )}
    </g>
  );
};

const TopRecurringIssuesReport = () => {
  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={DATA}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent />}
        >
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default TopRecurringIssuesReport;