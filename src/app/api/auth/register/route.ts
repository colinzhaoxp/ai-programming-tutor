import { prisma } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, username },
    });

    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return Response.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch {
    return Response.json({ error: "注册失败" }, { status: 500 });
  }
}
