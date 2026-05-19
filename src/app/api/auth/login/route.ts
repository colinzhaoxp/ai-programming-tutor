import { prisma } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return Response.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch {
    return Response.json({ error: "登录失败" }, { status: 500 });
  }
}
