"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  X,
  Send,
  Maximize2,
  Minimize2,
  Trash2,
  Loader2,
  Zap,
  Mic,
  MicOff,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { getAssistantResponse } from "@/features/assistant/services/assistant.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DashboardAssistant = ({ dashboardData }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /* ---------------- SCROLL ---------------- */

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [messages, isLoading]);

  /* ---------------- LOAD CHAT HISTORY ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("assistant_chat");

    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("assistant_chat", JSON.stringify(messages));
  }, [messages]);

  /* ---------------- VOICE INPUT ---------------- */

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognitionRef.current.onend = () => setListening(false);
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getAssistantResponse(content, dashboardData);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    }

    setIsLoading(false);
  };

  /* ---------------- PROACTIVE INSIGHTS ---------------- */

  useEffect(() => {
    if (!dashboardData) return;

    if (dashboardData.failedIntegrations > 10) {
      const alertMsg: Message = {
        id: "alert_" + Date.now(),
        role: "assistant",
        content: `⚠️ Alert: ${dashboardData.failedIntegrations} integrations failed in the last hour.`,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, alertMsg]);
    }
  }, [dashboardData]);

  /* ---------------- CLEAR CHAT ---------------- */

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("assistant_chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mb-4 overflow-hidden shadow-2xl rounded-2xl border bg-background flex flex-col",
              isExpanded ? "w-[600px] h-[700px]" : "w-[380px] h-[500px]"
            )}
          >
            {/* HEADER */}

            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-2 items-center">
                <Brain className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-sm">
                  AI Operations Assistant
                </span>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={clearChat}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* CHAT */}

            <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "mb-3 text-sm p-3 rounded-xl max-w-[80%]",
                    m.role === "assistant"
                      ? "bg-muted"
                      : "bg-indigo-600 text-white ml-auto"
                  )}
                >
                  {m.content}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI thinking...
                </div>
              )}
            </ScrollArea>

            {/* INPUT */}

            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Ask about tickets, integrations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
              />

              <Button
                size="icon"
                variant={listening ? "destructive" : "secondary"}
                onClick={toggleVoice}
              >
                {listening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="icon"
                onClick={() => handleSend(input)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT BUTTON */}

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
};

export default DashboardAssistant;