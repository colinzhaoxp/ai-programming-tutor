"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

interface LearningEvent {
  id: string;
  eventType: string;
  eventData: string | null;
  createdAt: string;
}

const EVENT_LABELS: Record<string, string> = {
  assessment_completed: "完成评估",
  plan_generated: "生成学习计划",
  document_viewed: "查看文档",
  stage_started: "开始阶段",
  stage_completed: "完成阶段",
  exercise_completed: "完成练习",
  code_submitted: "提交代码",
  ai_feedback_generated: "AI 反馈",
};

const EVENT_DOT_COLORS: Record<string, string> = {
  assessment_completed: "bg-blue-500",
  plan_generated: "bg-green-500",
  document_viewed: "bg-purple-500",
  code_submitted: "bg-orange-500",
  ai_feedback_generated: "bg-teal-500",
};

export default function HistoryPage() {
  const params = useParams();
  const goalId = params.goalId as string;
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/learning-goals/${goalId}/events`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, [goalId]);

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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">学习历史</h1>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">暂无学习记录</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative ml-4 space-y-0">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
            {events.map((event) => {
              let parsedData: Record<string, unknown> | null = null;
              try {
                if (event.eventData) parsedData = JSON.parse(event.eventData);
              } catch {
                // ignore
              }

              return (
                <div key={event.id} className="relative pl-6 py-3">
                  <div
                    className={`absolute left-[-5px] top-5 h-3 w-3 rounded-full border-2 border-white ${
                      EVENT_DOT_COLORS[event.eventType] || "bg-gray-400"
                    }`}
                  />
                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {EVENT_LABELS[event.eventType] || event.eventType}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      {parsedData && (
                        <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                          {JSON.stringify(parsedData, null, 2)}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
