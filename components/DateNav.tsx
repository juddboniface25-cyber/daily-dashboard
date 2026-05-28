"use client";

import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateNavProps {
  date: string;
  onDateChange: (date: string) => void;
}

export default function DateNav({ date, onDateChange }: DateNavProps) {
  const parsed = parseISO(date);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(format(subDays(parsed, 1), "yyyy-MM-dd"))}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-52 text-center text-lg font-semibold">
        {format(parsed, "EEEE, MMMM d")}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(format(addDays(parsed, 1), "yyyy-MM-dd"))}
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={date === today}
        onClick={() => onDateChange(today)}
      >
        Today
      </Button>
    </div>
  );
}
