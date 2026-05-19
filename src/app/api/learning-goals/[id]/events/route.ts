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
  const events = await prisma.learningEvent.findMany({
    where: { learningGoalId: id, userId: user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json(events);
}
