import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const goals = await prisma.learningGoal.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(goals);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { sourceLanguage, targetLanguage, goalDescription } =
    await request.json();

  if (!sourceLanguage || !targetLanguage) {
    return Response.json(
      { error: "源语言和目标语言不能为空" },
      { status: 400 }
    );
  }

  const goal = await prisma.learningGoal.create({
    data: {
      userId: user.userId,
      sourceLanguage,
      targetLanguage,
      goalDescription,
    },
  });

  // Create user profile if not exists
  await prisma.userProfile.upsert({
    where: { userId: user.userId },
    update: {},
    create: {
      userId: user.userId,
      knownLanguages: JSON.stringify([sourceLanguage]),
      targetLanguages: JSON.stringify([targetLanguage]),
    },
  });

  return Response.json(goal);
}
