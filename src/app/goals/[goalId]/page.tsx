"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GoalDetail {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  goalDescription: string | null;
  status: string;
  assessments: {
    id: string;
    level: string;
    score: number | null;
    strengths: string;
    weaknesses: string;
    aiSummary: string | null;
  }[];
  learningPlans: {
    id: string;
    title: string;
    description: string | null;
    stages: {
      id: string;
      order: number;
      title: string;
      description: string | null;
      keyTopics: string;
      status: string;
      estimatedHours: number | null;
    }[];
  }[];
  skillProfiles: {
    id: string;
    topic: string;
    masteryLevel: number;
  }[];
}

export default function GoalDetailPage() {
  const params = useParams();
  const goalId = params.goalId as string;
  const [goal, setGoal] = useState<GoalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/learning-goals/${goalId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setGoal(data))
      .finally(() => setLoading(false));
  }, [goalId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-gray-500">加载中...</p>
        </main>
      </>
    );
  }

  if (!goal) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-gray-500">目标不存在</p>
        </main>
      </>
    );
  }

  const latestAssessment = goal.assessments[0];
  const latestPlan = goal.learningPlans[0];
  const completedStages = latestPlan?.stages.filter(
    (s) => s.status === "completed"
  ).length || 0;
  const totalStages = latestPlan?.stages.length || 0;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {goal.sourceLanguage} → {goal.targetLanguage}
          </h1>
          {goal.goalDescription && (
            <p className="mt-2 text-gray-600">{goal.goalDescription}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Assessment Card */}
          <Card>
            <CardHeader>
              <CardTitle>能力评估</CardTitle>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <div className="space-y-2">
                  <p>
                    等级:{" "}
                    <Badge>{latestAssessment.level}</Badge>
                  </p>
                  {latestAssessment.score !== null && (
                    <p>分数: {latestAssessment.score}</p>
                  )}
                  {latestAssessment.aiSummary && (
                    <p className="text-sm text-gray-600">
                      {latestAssessment.aiSummary}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-gray-500">尚未完成评估</p>
                  <Link href={`/goals/${goalId}/assessment`}>
                    <Button>开始评估</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>学习进度</CardTitle>
            </CardHeader>
            <CardContent>
              {latestPlan ? (
                <div className="space-y-4">
                  <p className="font-medium">{latestPlan.title}</p>
                  <Progress value={progress} />
                  <p className="text-sm text-gray-600">
                    {completedStages} / {totalStages} 阶段完成
                  </p>
                  <Link href={`/goals/${goalId}/plan`}>
                    <Button variant="outline" size="sm">
                      查看学习路线
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-gray-500">尚未生成学习计划</p>
                  {latestAssessment ? (
                    <Link href={`/goals/${goalId}/plan`}>
                      <Button>生成学习计划</Button>
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-400">
                      请先完成能力评估
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>能力画像</CardTitle>
            </CardHeader>
            <CardContent>
              {goal.skillProfiles.length > 0 ? (
                <div className="space-y-3">
                  {goal.skillProfiles.map((sp) => (
                    <div key={sp.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{sp.topic}</span>
                        <span>{sp.masteryLevel}%</span>
                      </div>
                      <Progress value={sp.masteryLevel} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">完成评估后生成能力画像</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/goals/${goalId}/documents`}>
                <Button variant="outline" className="w-full justify-start">
                  学习文档
                </Button>
              </Link>
              <Link href={`/goals/${goalId}/exercises`}>
                <Button variant="outline" className="w-full justify-start">
                  练习题
                </Button>
              </Link>
              <Link href={`/goals/${goalId}/history`}>
                <Button variant="outline" className="w-full justify-start">
                  学习历史
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
