import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold">AI 个性化编程语言学习平台</h1>
          <p className="mb-8 text-lg text-gray-600">
            根据你的已有编程基础，生成专属的新语言学习路线
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">开始学习</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                登录
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <h2 className="mb-8 text-center text-2xl font-semibold">核心功能</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>能力评估</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  通过评估测试了解你对已有语言的掌握程度，AI 分析你的强项和弱项。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>个性化学习路线</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI 根据你的能力画像生成专属学习计划，对照已有语言降低学习成本。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI 代码反馈</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  提交代码后获得 AI 反馈，指出 C 语言式思维并建议更 Pythonic 的写法。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
