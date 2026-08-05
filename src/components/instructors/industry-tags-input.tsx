"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { parseIndustriesInput } from "@/lib/instructor-application";

type Props = {
  industries: string[];
  onChange: (industries: string[]) => void;
  label?: React.ReactNode;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

export function IndustryTagsInput({
  industries,
  onChange,
  label,
  description,
  placeholder = "専門分野を入力して Enter（例: 経営）",
  required,
}: Props) {
  const [input, setInput] = useState("");

  const addIndustry = (raw: string) => {
    const value = raw.trim();
    if (!value || industries.includes(value)) {
      setInput("");
      return;
    }
    onChange([...industries, value]);
    setInput("");
  };

  const removeIndustry = (value: string) => {
    onChange(industries.filter((item) => item !== value));
  };

  const addMany = (raw: string) => {
    const next = [...industries];
    for (const item of parseIndustriesInput(raw)) {
      if (!next.includes(item)) next.push(item);
    }
    onChange(next);
    setInput("");
  };

  return (
    <div className="sm:col-span-2">
      {label}
      {description && <p className="mb-3 text-xs text-gray-500">{description}</p>}
      {industries.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {industries.map((ind) => (
            <Badge key={ind} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1">
              {ind}
              <button
                type="button"
                onClick={() => removeIndustry(ind)}
                className="rounded-full p-0.5 hover:bg-gray-300/60"
                aria-label={`${ind} を削除`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addIndustry(input);
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes(",") || text.includes("、")) {
              e.preventDefault();
              addMany(text);
            }
          }}
          placeholder={placeholder}
          required={required && industries.length === 0}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addIndustry(input)}
          className="shrink-0"
          aria-label="専門分野を追加"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
