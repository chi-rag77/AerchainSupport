"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeographySummary } from '@/features/dashboard/types';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Sphere, 
  Graticule 
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Globe, Map as MapIcon, TrendingUp, Users, CheckCircle2, Hourglass, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeographyInsightsProps {
  data: GeographySummary;
}

const GeographyInsights = ({ data }: GeographyInsightsProps) => {
  const colorScale = useMemo(() => {
    const maxTickets = Math.max(...data.distribution.map(d => d.total), 1);
    return scaleLinear<string>()
      .domain([0, maxTickets])
      .range(["#e0e7ff", "#4338ca"]); // Indigo-100 to Indigo-700
  }, [data.distribution]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Global Usage Visibility</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Countries</span>
            <span className="text-xl font-black text-indigo-600">{data.activeCountries}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Tickets</span>
            <span className="text-xl font-black text-foreground">{data.totalGlobalTickets}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Region</span>
            <span className="text-xl font-black text-indigo-600">{data.topRegion}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Interactive Map */}
        <Card className="lg:col-span-2 rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-muted-foreground" />
              Global Ticket Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[450px] flex items-center justify-center">
            <ComposableMap 
              projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
              className="w-full h-full"
            >
              <Sphere stroke="#E4E7EB" strokeWidth={0.5} id="sphere" fill="transparent" />
              <Graticule stroke="#E4E7EB" strokeWidth={0.5} />
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    // Match by Numeric ID, ISO Code, or Name for maximum compatibility
                    const countryData = data.distribution.find(d => 
                      d.countryCode === geo.id || 
                      d.countryCode === geo.properties.ISO_A3 ||
                      d.countryName.toLowerCase() === geo.properties.name.toLowerCase()
                    );
                    
                    return (
                      <Tooltip key={geo.rsmKey}>
                        <TooltipTrigger asChild>
                          <Geography
                            geography={geo}
                            fill={countryData ? colorScale(countryData.total) : "#F3F4F6"}
                            stroke="#FFFFFF"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { fill: "#312e81", outline: "none", cursor: "pointer" },
                              pressed: { outline: "none" },
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="p-4 rounded-2xl shadow-2xl border-none bg-white dark:bg-gray-900">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black">{geo.properties.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets</span>
                                <p className="text-lg font-black">{countryData?.total || 0}</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved</span>
                                <p className="text-lg font-black text-green-600">{countryData?.resolved || 0}</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Open</span>
                                <p className="text-lg font-black text-amber-600">{countryData?.open || 0}</p>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </CardContent>
        </Card>

        {/* Right: Country Distribution Panel */}
        <Card className="rounded-[28px] border-none bg-white dark:bg-gray-800 shadow-glass overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-grow overflow-y-auto">
            <div className="space-y-4">
              {data.distribution.length > 0 ? (
                data.distribution.slice(0, 8).map((country, i) => (
                  <div key={country.countryName} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-border group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                        {i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-sm">{country.countryName}</h5>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> {country.resolved}
                          </span>
                          <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
                            <Hourglass className="h-2.5 w-2.5" /> {country.open}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                      <div className="text-lg font-black text-indigo-600">{country.total}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center space-y-2">
                  <Info className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium">No geographic data available for this period.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GeographyInsights;