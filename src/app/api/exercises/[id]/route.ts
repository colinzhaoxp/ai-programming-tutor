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
  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: user.userId },
    include: { submissions: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  if (!exercise) {
    return Response.json({ error: "练习不存在" }, { status: 404 });
  }

  return Response.json(exercise);
}
