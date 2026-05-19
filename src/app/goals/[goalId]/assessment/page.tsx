"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  questionType: string;
  topic: string;
  difficulty: string;
  question: string;
  options: string | null;
}

interface AssessmentResult {
  id: string;
  level: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export default function AssessmentPage() {
  const params = useParams();
  const goalId = params.goalId as string;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/assessments/questions?source=C&target=Python")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setQuestions(data))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setError("");
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      setError(`还有 ${unanswered.length} 道题未作答`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningGoalId: goalId,
          answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
            questionId,
            userAnswer,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交失败");
        return;
      }

      setResult(data.assessment);
    } catch {
      setError("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-gray-500">加载题目中...</p>
        </main>
      </>
    );
  }

  if (result) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>评估结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">能力等级</p>
                  <Badge className="text-lg">{result.level}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">得分</p>
                  <p className="text-2xl font-bold">{result.score}%</p>
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium">强项</p>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((s, i) => (
                    <Badge key={i} variant="default">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium">弱项</p>
                <div className="flex flex-wrap gap-2">
                  {result.weaknesses.map((w, i) => (
                    <Badge key={i} variant="destructive">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium">AI 评估总结</p>
                <p className="text-gray-600">{result.summary}</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => router.push(`/goals/${goalId}/plan`)}>
                  生成学习计划
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/goals/${goalId}`)}
                >
                  返回目标详情
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">C → Python 能力评估</h1>
        <p className="mb-8 text-gray-600">
          完成以下题目，帮助我们了解你的编程基础。
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    第 {index + 1} 题
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{q.topic}</Badge>
                    <Badge
                      variant={
                        q.difficulty === "easy"
                          ? "default"
                          : q.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{q.question}</p>

                {q.questionType === "choice" && q.options ? (
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(value) => handleAnswer(q.id, value)}
                  >
                    {JSON.parse(q.options).map(
                      (opt: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={opt} id={`${q.id}-${i}`} />
                          <Label htmlFor={`${q.id}-${i}`}>{opt}</Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                ) : (
                  <div>
                    <Label htmlFor={`text-${q.id}`}>你的回答</Label>
                    <Textarea
                      id={`text-${q.id}`}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      placeholder="请输入你的回答..."
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting ? "提交评估中..." : "提交评估"}
          </Button>
        </div>
      </main>
    </>
  );
}
