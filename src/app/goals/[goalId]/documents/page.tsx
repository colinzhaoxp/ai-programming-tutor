"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  title: string;
  topic: string;
  contentMarkdown: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const goalId = params.goalId as string;
  const stageId = searchParams.get("stageId");
  const topic = searchParams.get("topic") || "Python 基础";

  const [docs, setDocs] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/learning-goals/${goalId}/documents`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setDocs(data);
        if (data.length > 0 && !currentDoc) {
          setCurrentDoc(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [goalId, currentDoc]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningGoalId: goalId,
          stageId,
          topic,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentDoc(data);
        setDocs((prev) => [data, ...prev]);
      }
    } finally {
      setGenerating(false);
    }
  };

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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">学习文档</h1>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "AI 生成中..." : `生成 "${topic}" 文档`}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar - Document List */}
          <div className="space-y-2">
            <h3 className="mb-2 font-medium">文档列表</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500">暂无文档</p>
            ) : (
              docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setCurrentDoc(doc)}
                  className={`w-full rounded-lg p-3 text-left text-sm transition-colors ${
                    currentDoc?.id === doc.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium">{doc.topic}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {currentDoc ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{currentDoc.title}</CardTitle>
                    <Badge>{currentDoc.topic}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <article className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentDoc.contentMarkdown}
                    </ReactMarkdown>
                  </article>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-gray-500">
                    选择一个文档或生成新文档
                  </p>
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? "生成中..." : "生成文档"}
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
