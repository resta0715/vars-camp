"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IndustryLink } from "@/lib/instructor-application";

type Props = {
  links: IndustryLink[];
  onChange: (links: IndustryLink[]) => void;
  label?: React.ReactNode;
  description?: string;
};

export function IndustryLinksInput({ links, onChange, label, description }: Props) {
  const updateRow = (index: number, key: keyof IndustryLink, value: string) => {
    onChange(links.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    onChange([...links, { name: "", url: "" }]);
  };

  const removeRow = (index: number) => {
    if (links.length <= 1) {
      onChange([{ name: "", url: "" }]);
      return;
    }
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="sm:col-span-2 space-y-3">
      {label}
      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div className="hidden gap-2 px-1 text-xs font-medium text-gray-500 sm:grid sm:grid-cols-[1fr_1fr_auto]">
        <span>業種・専門分野</span>
        <span className="sm:col-span-1">Webサイト・SNS URL</span>
        <span className="w-9" />
      </div>

      <div className="space-y-3">
        {links.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:p-2"
          >
            <div>
              <label className="mb-1 block text-xs text-gray-500 sm:sr-only">業種・専門分野</label>
              <Input
                value={row.name}
                onChange={(e) => updateRow(index, "name", e.target.value)}
                placeholder="例: 不動産仲介"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 sm:sr-only">Webサイト・SNS URL</label>
              <Input
                value={row.url}
                onChange={(e) => updateRow(index, "url", e.target.value)}
                placeholder="例: https://example.com"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
              className="justify-self-end text-gray-400 hover:text-red-500"
              aria-label="この行を削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <Plus className="h-4 w-4" />
        業種と URL を追加
      </Button>
    </div>
  );
}
