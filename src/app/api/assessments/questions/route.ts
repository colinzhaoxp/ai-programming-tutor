import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const url = new URL(request.url);
  const source = url.searchParams.get("source") || "C";
  const target = url.searchParams.get("target") || "Python";

  const questions = await prisma.assessmentQuestion.findMany({
    where: {
      sourceLanguage: source,
      targetLanguage: target,
    },
    select: {
      id: true,
      questionType: true,
      topic: true,
      difficulty: true,
      question: true,
      options: true,
      // Don't include answer and explanation
    },
  });

  return Response.json(questions);
}
