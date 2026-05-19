import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runCodeFeedbackAgent } from "@/lib/ai/agents/code-feedback-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { exerciseId, code } = await request.json();

  if (!exerciseId || !code) {
    return Response.json({ error: "缺少必要参数" }, { status: 400 });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId: user.userId },
  });

  if (!exercise) {
    return Response.json({ error: "练习不存在" }, { status: 404 });
  }

  // Get user weaknesses
  const goal = await prisma.learningGoal.findFirst({
    where: { id: exercise.learningGoalId },
    include: { skillProfiles: true },
  });

  const weaknesses = (goal?.skillProfiles || [])
    .filter((sp) => sp.masteryLevel < 50)
    .map((sp) => sp.topic);

  // Run code feedback agent
  const feedback = await runCodeFeedbackAgent({
    sourceLanguage: goal?.sourceLanguage || "C",
    targetLanguage: goal?.targetLanguage || "Python",
    exerciseDescription: exercise.description,
    code,
    weaknesses,
  });

  // Save submission
  const submission = await prisma.codeSubmission.create({
    data: {
      userId: user.userId,
      exerciseId,
      language: goal?.targetLanguage || "Python",
      code,
      aiFeedback: feedback,
    },
  });

  // Write learning events
  await prisma.learningEvent.create({
    data: {
      userId: user.userId,
      learningGoalId: exercise.learningGoalId,
      eventType: "code_submitted",
      eventData: JSON.stringify({
        submissionId: submission.id,
        exerciseId,
      }),
    },
  });

  await prisma.learningEvent.create({
    data: {
      userId: user.userId,
      learningGoalId: exercise.learningGoalId,
      eventType: "ai_feedback_generated",
      eventData: JSON.stringify({
        submissionId: submission.id,
      }),
    },
  });

  return Response.json({ submission, feedback });
}
