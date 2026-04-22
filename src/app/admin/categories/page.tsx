"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", color: "#9333ea" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCat.name || !newCat.slug) {
      alert("名前とスラッグは必須です");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description || null,
        color: newCat.color,
        sort_order: categories.length + 1,
      })
      .select()
      .single();

    if (error) {
      alert("追加に失敗しました: " + error.message);
      return;
    }

    setCategories([...categories, data]);
    setNewCat({ name: "", slug: "", description: "", color: "#9333ea" });
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`カテゴリ「${name}」を削除しますか？`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }

    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateColor = async (id: string, color: string) => {
    const supabase = createClient();
    await supabase.from("categories").update({ color }).eq("id", id);
    setCategories(categories.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">カテゴリ管理</h1>

      {/* Current Categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">現在のカテゴリ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400">読み込み中...</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={cat.color}
                      onChange={(e) => updateColor(cat.id, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => deleteCategory(cat.id, cat.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">新しいカテゴリを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">名前 *</label>
              <Input
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                placeholder="例: 独立・開業"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">スラッグ *</label>
              <Input
                value={newCat.slug}
                onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                placeholder="例: startup"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">説明</label>
              <Input
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                placeholder="カテゴリの説明"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">カラー</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-200"
                />
                <Input value={newCat.color} readOnly className="flex-1" />
              </div>
            </div>
          </div>
          <Button className="mt-4" onClick={addCategory} disabled={!newCat.name || !newCat.slug}>
            <Plus className="mr-1.5 h-4 w-4" />
            追加
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
