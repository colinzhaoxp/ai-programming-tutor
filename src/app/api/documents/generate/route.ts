import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runDocumentAgent } from "@/lib/ai/agents/document-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { learningGoalId, stageId, topic } = await request.json();

  const goal = await prisma.learningGoal.findFirst({
    where: { id: learningGoalId, userId: user.userId },
    include: { skillProfiles: true },
  });

  if (!goal) {
    return Response.json({ error: "目标不存在" }, { status: 404 });
  }

  const weaknesses = goal.skillProfiles
    .filter((sp) => sp.masteryLevel < 50)
    .map((sp) => sp.topic);

  const content = await runDocumentAgent({
    sourceLanguage: goal.sourceLanguage,
    targetLanguage: goal.targetLanguage,
    topic,
    userWeaknesses: weaknesses,
  });

  const doc = await prisma.learningDocument.create({
    data: {
      userId: user.userId,
      learningGoalId,
      stageId: stageId || null,
      title: `${topic} 学习文档：面向 ${goal.sourceLanguage} 学习者`,
      sourceLanguage: goal.sourceLanguage,
      targetLanguage: goal.targetLanguage,
      topic,
      contentMarkdown: content,
    },
  });

  await prisma.learningEvent.create({
    data: {
      userId: user.userId,
      learningGoalId,
      eventType: "document_viewed",
      eventData: JSON.stringify({ documentId: doc.id, topic }),
    },
  });

  return Response.json(doc);
}
