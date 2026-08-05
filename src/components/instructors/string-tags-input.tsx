"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { parseListInput } from "@/lib/instructor-application";

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
  label?: React.ReactNode;
  description?: string;
  placeholder?: string;
  required?: boolean;
  addAriaLabel?: string;
  removeAriaLabel?: (item: string) => string;
  normalize?: (value: string) => string;
};

export function StringTagsInput({
  items,
  onChange,
  label,
  description,
  placeholder,
  required,
  addAriaLabel = "追加",
  removeAriaLabel = (item) => `${item} を削除`,
  normalize = (value) => value.trim(),
}: Props) {
  const [input, setInput] = useState("");

  const addItem = (raw: string) => {
    const value = normalize(raw);
    if (!value || items.includes(value)) {
      setInput("");
      return;
    }
    onChange([...items, value]);
    setInput("");
  };

  const removeItem = (value: string) => {
    onChange(items.filter((item) => item !== value));
  };

  const addMany = (raw: string) => {
    const next = [...items];
    for (const item of parseListInput(raw).map(normalize)) {
      if (item && !next.includes(item)) next.push(item);
    }
    onChange(next);
    setInput("");
  };

  return (
    <div className="sm:col-span-2">
      {label}
      {description && <p className="mb-3 text-xs text-gray-500">{description}</p>}
      {items.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="rounded-full p-0.5 hover:bg-gray-300/60"
                aria-label={removeAriaLabel(item)}
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
              addItem(input);
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes(",") || text.includes("、") || text.includes("\n")) {
              e.preventDefault();
              addMany(text);
            }
          }}
          placeholder={placeholder}
          required={required && items.length === 0}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addItem(input)}
          className="shrink-0"
          aria-label={addAriaLabel}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
