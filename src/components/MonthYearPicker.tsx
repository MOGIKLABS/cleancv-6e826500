import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MonthYearPicker = ({ value, onChange, placeholder = "Select date" }: MonthYearPickerProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [open, setOpen] = useState(false);

  const handleSelect = (month: string) => {
    onChange(`${month} ${year}`);
    setOpen(false);
  };

  const handlePresent = () => {
    onChange("Present");
    setOpen(false);
  };

  return (
    <div className="flex gap-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <CalendarIcon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-3 pointer-events-auto" align="end">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear((y) => y - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{year}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear((y) => y + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m) => (
              <Button
                key={m}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  value === `${m} ${year}` && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => handleSelect(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          {/* Present button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={handlePresent}
          >
            Present
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MonthYearPicker;
