import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runLearningPlanAgent } from "@/lib/ai/agents/learning-plan-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { learningGoalId } = await request.json();

  const goal = await prisma.learningGoal.findFirst({
    where: { id: learningGoalId, userId: user.userId },
    include: {
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
      skillProfiles: true,
    },
  });

  if (!goal) {
    return Response.json({ error: "目标不存在" }, { status: 404 });
  }

  const assessment = goal.assessments[0];
  if (!assessment) {
    return Response.json(
      { error: "请先完成能力评估" },
      { status: 400 }
    );
  }

  const result = await runLearningPlanAgent({
    sourceLanguage: goal.sourceLanguage,
    targetLanguage: goal.targetLanguage,
    skillProfile: goal.skillProfiles.map((sp) => ({
      topic: sp.topic,
      masteryLevel: sp.masteryLevel,
    })),
    assessmentSummary: assessment.aiSummary || "",
  });

  const plan = await prisma.learningPlan.create({
    data: {
      userId: user.userId,
      learningGoalId,
      title: result.title,
      description: result.description,
      aiGeneratedReason: result.aiGeneratedReason,
      stages: {
        create: result.stages.map((stage) => ({
          order: stage.order,
          title: stage.title,
          description: stage.description,
          keyTopics: JSON.stringify(stage.keyTopics),
          estimatedHours: stage.estimatedHours,
        })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  await prisma.learningEvent.create({
    data: {
      userId: user.userId,
      learningGoalId,
      eventType: "plan_generated",
      eventData: JSON.stringify({ planId: plan.id }),
    },
  });

  return Response.json(plan);
}
