"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface Exercise {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  starterCode: string | null;
  expectedOutput: string | null;
  submissions: {
    id: string;
    code: string;
    aiFeedback: string | null;
    score: number | null;
    createdAt: string;
  }[];
}

export default function ExercisesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const goalId = params.goalId as string;
  const stageId = searchParams.get("stageId");
  const topic = searchParams.get("topic") || "Python 基础";

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/learning-goals/${goalId}/exercises`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setExercises(data);
        if (data.length > 0 && !currentExercise) {
          selectExercise(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [goalId]);

  const selectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    setCode(ex.submissions?.[0]?.code || ex.starterCode || "");
    setFeedback(ex.submissions?.[0]?.aiFeedback || null);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/exercises/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningGoalId: goalId, stageId, topic }),
      });
      const data = await res.json();
      if (res.ok) {
        setExercises((prev) => [...data, ...prev]);
        if (data.length > 0) selectExercise(data[0]);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentExercise || !code.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/code-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: currentExercise.id, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.feedback);
        const exRes = await fetch(`/api/exercises/${currentExercise.id}`);
        const updatedEx = await exRes.json();
        if (exRes.ok) {
          setCurrentExercise(updatedEx);
          setExercises((prev) =>
            prev.map((e) => (e.id === updatedEx.id ? updatedEx : e))
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-gray-500">加载中...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">代码练习</h1>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "AI 生成中..." : `生成 "${topic}" 练习题`}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <h3 className="mb-2 font-medium">练习列表</h3>
            {exercises.length === 0 ? (
              <p className="text-sm text-gray-500">暂无练习题</p>
            ) : (
              exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => selectExercise(ex)}
                  className={`w-full rounded-lg p-3 text-left text-sm transition-colors ${
                    currentExercise?.id === ex.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{ex.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        ex.difficulty === "easy"
                          ? "default"
                          : ex.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {ex.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-400">{ex.topic}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {currentExercise ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{currentExercise.title}</CardTitle>
                      <Badge>{currentExercise.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{currentExercise.description}</p>
                    {currentExercise.expectedOutput && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">期望输出</p>
                        <p className="text-sm">{currentExercise.expectedOutput}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">代码编辑器</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[400px] overflow-hidden rounded border">
                      <MonacoEditor
                        height="400px"
                        language="python"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "提交中..." : "提交代码"}
                    </Button>
                  </CardContent>
                </Card>

                {feedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI 反馈</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <article className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
                      </article>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-gray-500">选择一道练习或生成新练习</p>
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? "生成中..." : "生成练习题"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
