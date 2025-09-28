"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onSelectedChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onSelectedChange, placeholder, className }, ref) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string) => {
      const newSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onSelectedChange(newSelected);
    };

    const handleClearAll = () => {
      onSelectedChange([]);
    };

    const handleSelectAll = () => {
      onSelectedChange(options.map(option => option.value));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            ref={ref}
          >
            <div className="flex flex-wrap gap-1">
              {selected.length === 0
                ? placeholder || "Select items..."
                : selected.length === options.length
                ? "All selected"
                : selected.map((value) => {
                    const option = options.find((opt) => opt.value === value);
                    return (
                      <Badge key={value} variant="secondary" className="flex items-center">
                        {option?.label || value}
                        <span
                          className="ml-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(value);
                          }}
                        >
                          &times;
                        </span>
                      </Badge>
                    );
                  })}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={handleSelectAll}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.length === options.length ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Select All
                </CommandItem>
                <CommandItem
                  onSelect={handleClearAll}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.length === 0 ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Clear All
                </CommandItem>
                <CommandSeparator />
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };