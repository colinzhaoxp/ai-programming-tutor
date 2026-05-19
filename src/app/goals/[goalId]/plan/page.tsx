"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Stage {
  id: string;
  order: number;
  title: string;
  description: string | null;
  keyTopics: string;
  status: string;
  estimatedHours: number | null;
}

interface Plan {
  id: string;
  title: string;
  description: string | null;
  aiGeneratedReason: string | null;
  stages: Stage[];
}

export default function PlanPage() {
  const params = useParams();
  const goalId = params.goalId as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/learning-goals/${goalId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.learningPlans?.[0]) {
          setPlan(data.learningPlans[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [goalId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/learning-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningGoalId: goalId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlan(data);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-gray-500">加载中...</p>
        </main>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">学习路线</h1>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">尚未生成学习计划</p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? "生成中..." : "AI 生成学习计划"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{plan.title}</h1>
        {plan.description && (
          <p className="mb-2 text-gray-600">{plan.description}</p>
        )}
        {plan.aiGeneratedReason && (
          <p className="mb-8 text-sm text-gray-400">
            AI 生成原因: {plan.aiGeneratedReason}
          </p>
        )}

        <div className="space-y-4">
          {plan.stages.map((stage) => {
            const topics: string[] = JSON.parse(stage.keyTopics || "[]");
            return (
              <Card key={stage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {stage.order}
                      </span>
                      {stage.title}
                    </CardTitle>
                    <Badge
                      variant={
                        stage.status === "completed"
                          ? "default"
                          : stage.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {stage.status === "completed"
                        ? "已完成"
                        : stage.status === "in_progress"
                          ? "进行中"
                          : "未开始"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {stage.description && (
                    <p className="mb-3 text-sm text-gray-600">
                      {stage.description}
                    </p>
                  )}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {topics.map((topic, i) => (
                      <Badge key={i} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      预计 {stage.estimatedHours || 2} 小时
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/goals/${goalId}/documents?stageId=${stage.id}&topic=${encodeURIComponent(topics[0] || stage.title)}`}
                      >
                        <Button size="sm" variant="outline">
                          查看文档
                        </Button>
                      </Link>
                      <Link
                        href={`/goals/${goalId}/exercises?stageId=${stage.id}&topic=${encodeURIComponent(topics[0] || stage.title)}`}
                      >
                        <Button size="sm">开始练习</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
