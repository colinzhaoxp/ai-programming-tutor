"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function NewGoalPage() {
  const [sourceLanguage, setSourceLanguage] = useState("C");
  const [targetLanguage, setTargetLanguage] = useState("Python");
  const [goalDescription, setGoalDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/learning-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguage,
          goalDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建失败");
        return;
      }

      router.push(`/goals/${data.id}`);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">创建学习目标</h1>
        <Card>
          <CardHeader>
            <CardTitle>设定你的学习目标</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div className="space-y-2">
                <Label htmlFor="source">已掌握的语言</Label>
                <Input
                  id="source"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">目标学习语言</Label>
                <Input
                  id="target"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">学习目的（可选）</Label>
                <Input
                  id="description"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="例如：学习 Python 并完成基础项目开发"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "创建中..." : "创建学习目标"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
