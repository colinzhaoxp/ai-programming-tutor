"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          AI 编程学习平台
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" onClick={logout}>
                登出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/register">
                <Button>注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
