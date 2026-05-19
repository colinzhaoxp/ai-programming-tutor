"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LearningGoal {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  goalDescription: string | null;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/learning-goals")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setGoals(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">学习仪表盘</h1>
          <Link href="/goals/new">
            <Button>创建学习目标</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">加载中...</p>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">还没有学习目标</p>
              <Link href="/goals/new">
                <Button>创建你的第一个学习目标</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {goal.sourceLanguage} → {goal.targetLanguage}
                      </CardTitle>
                      <Badge
                        variant={
                          goal.status === "active" ? "default" : "secondary"
                        }
                      >
                        {goal.status === "active" ? "进行中" : goal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {goal.goalDescription || "暂无描述"}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      创建于{" "}
                      {new Date(goal.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
