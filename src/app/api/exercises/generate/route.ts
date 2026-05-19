import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runExerciseAgent } from "@/lib/ai/agents/exercise-agent";

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

  const avgMastery =
    goal.skillProfiles.length > 0
      ? goal.skillProfiles.reduce((sum, sp) => sum + sp.masteryLevel, 0) /
        goal.skillProfiles.length
      : 30;

  const level =
    avgMastery >= 80
      ? "advanced"
      : avgMastery >= 60
        ? "intermediate"
        : avgMastery >= 40
          ? "basic"
          : "beginner";

  const exercises = await runExerciseAgent({
    sourceLanguage: goal.sourceLanguage,
    targetLanguage: goal.targetLanguage,
    topic,
    level,
    weaknesses,
  });

  const created = await Promise.all(
    exercises.map((ex) =>
      prisma.exercise.create({
        data: {
          userId: user.userId,
          learningGoalId,
          stageId: stageId || null,
          topic,
          difficulty: ex.difficulty,
          title: ex.title,
          description: ex.description,
          starterCode: ex.starterCode,
          expectedOutput: ex.expectedOutput,
        },
      })
    )
  );

  return Response.json(created);
}
