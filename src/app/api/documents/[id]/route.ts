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
  const doc = await prisma.learningDocument.findFirst({
    where: { id, userId: user.userId },
  });

  if (!doc) {
    return Response.json({ error: "文档不存在" }, { status: 404 });
  }

  return Response.json(doc);
}
