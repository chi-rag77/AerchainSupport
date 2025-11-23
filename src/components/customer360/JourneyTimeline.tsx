"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Event, MoodWavePoint } from "@/types";
import EventNode from "./EventNode";
import { cn } from "@/lib/utils";
import { format, parseISO, isWithinInterval, subDays, addDays } from 'date-fns';
import { ArrowLeft, ArrowRight, Play, Pause, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists

interface JourneyTimelineProps {
  events: Event[];
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  moodWave: MoodWavePoint[];
  onEventClick: (event: Event) => void;
}

const EVENTS_PER_LOAD = 30; // For lazy loading

const JourneyTimeline = ({ events, startDate, endDate, moodWave, onEventClick }: JourneyTimelineProps) => {
  const isMobile = useIsMobile();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [loadedEventsCount, setLoadedEventsCount] = useState(EVENTS_PER_LOAD);
  const [isPlayingStoryMode, setIsPlayingStoryMode] = useState(false);
  const [currentStoryEventIndex, setCurrentStoryEventIndex] = useState(0);
  const [storyNarrative, setStoryNarrative] = useState("");

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const displayedEvents = sortedEvents.slice(0, loadedEventsCount);

  const handleLoadMore = () => {
    setLoadedEventsCount(prevCount => Math.min(prevCount + EVENTS_PER_LOAD, sortedEvents.length));
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollWidth, scrollLeft, clientWidth } = scrollAreaRef.current;
      if (scrollWidth - scrollLeft - clientWidth < 100 && loadedEventsCount < sortedEvents.length) {
        handleLoadMore();
      }
    }
  };

  // Story Mode Logic
  useEffect(() => {
    let storyInterval: NodeJS.Timeout;
    if (isPlayingStoryMode && sortedEvents.length > 0) {
      const event = sortedEvents[currentStoryEventIndex];
      setStoryNarrative(`On ${format(new Date(event.date), 'MMM dd, yyyy')}, ${event.title}: ${event.summary}`);
      onEventClick(event); // Open the event card in story mode

      storyInterval = setInterval(() => {
        setCurrentStoryEventIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= sortedEvents.length) {
            setIsPlayingStoryMode(false);
            setStoryNarrative("Story mode finished.");
            return 0; // Reset for next play
          }
          return nextIndex;
        });
      }, 3000); // 3 seconds per event
    } else {
      clearInterval(storyInterval!);
      setStoryNarrative("");
    }
    return () => clearInterval(storyInterval!);
  }, [isPlayingStoryMode, currentStoryEventIndex, sortedEvents, onEventClick]);

  const toggleStoryMode = () => {
    setIsPlayingStoryMode(prev => !prev);
    setCurrentStoryEventIndex(0);
  };

  // Simplified MoodWave (sparkline)
  const renderMoodWaveSparkline = () => {
    if (moodWave.length === 0) return null;

    const sentimentMap = { 'positive': 2, 'neutral': 1, 'negative': 0 };
    const points = moodWave.map(mw => sentimentMap[mw.sentiment]);

    // Basic SVG sparkline
    const width = 100;
    const height = 20;
    const maxVal = 2; // positive
    const minVal = 0; // negative
    const range = maxVal - minVal;

    const pathData = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - minVal) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="ml-2">
        <path d={pathData} fill="none" stroke="url(#moodGradient)" strokeWidth="2" />
        <defs>
          <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5CA8" /> {/* Hot Pink */}
            <stop offset="50%" stopColor="#A7FF3D" /> {/* Lime Green */}
            <stop offset="100%" stopColor="#4EE1FF" /> {/* Neon Blue */}
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <Card className="bg-midnight-glass backdrop-blur-xl border border-white/10 shadow-glass text-white h-full flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Dynamic Customer Journey Map
            {renderMoodWaveSparkline()}
          </h2>
          <div className="flex items-center gap-2">
            {storyNarrative && (
              <p className="text-sm text-gray-300 italic flex items-center gap-1 animate-pulse">
                <Info className="h-4 w-4 text-neon-blue" /> {storyNarrative}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStoryMode}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              {isPlayingStoryMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Story Mode
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-gray-400 text-center">
            <p className="text-lg">
              No interactions found — invite {<span className="font-semibold">Danone</span>} to try new features or log first activity.
            </p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="flex-grow overflow-y-auto space-y-4">
                {displayedEvents.map((event, index) => (
                  <EventNode key={event.id} event={event} onClick={onEventClick} isMobile={true} />
                ))}
                {loadedEventsCount < sortedEvents.length && (
                  <div className="text-center mt-4">
                    <Button variant="outline" onClick={handleLoadMore} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ScrollArea className="flex-grow w-full">
                <div ref={scrollAreaRef} onScroll={handleScroll} className="flex items-center py-4 relative">
                  {/* Horizontal Timeline Line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-600 dark:bg-gray-700"></div>

                  {displayedEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                      <EventNode event={event} onClick={onEventClick} />
                      {index < displayedEvents.length - 1 && (
                        <div className="w-16 h-0.5 bg-gray-600 dark:bg-gray-700 relative -ml-1 -mr-1"></div>
                      )}
                    </React.Fragment>
                  ))}
                  {loadedEventsCount < sortedEvents.length && (
                    <div className="flex-shrink-0 w-24 flex items-center justify-center">
                      <Button variant="ghost" onClick={handleLoadMore} className="text-neon-blue hover:text-electric-purple">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyTimeline;