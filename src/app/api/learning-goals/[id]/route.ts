import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const goal = await prisma.learningGoal.findFirst({
    where: { id, userId: user.userId },
    include: {
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
      learningPlans: {
        include: { stages: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      skillProfiles: true,
    },
  });

  if (!goal) {
    return Response.json({ error: "目标不存在" }, { status: 404 });
  }

  return Response.json(goal);
}
