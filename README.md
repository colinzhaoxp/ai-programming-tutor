# AI Programming Tutor

一个基于 AI 的个性化编程语言学习平台。帮助你用已掌握的编程语言作为对照，快速迁移学习新的编程语言。

> MVP 场景：已有 C 语言基础 → 学习 Python

## 它能做什么

```
注册账号 → 创建学习目标（C → Python）
  → 完成能力评估（11道题，覆盖语法、数据结构、函数等）
  → AI 生成你的能力画像（强项 / 弱项 / 掌握度）
  → AI 生成个性化学习路线（6-8个阶段）
  → 查看 C vs Python 对照式学习文档
  → 在内置代码编辑器中完成练习题
  → 提交代码获取 AI 反馈（指出"C 思维"并建议 Pythonic 写法）
  → 查看完整学习历史时间线
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript |
| UI | React + shadcn/ui + Tailwind CSS |
| 数据库 | SQLite (Prisma ORM) |
| 认证 | JWT + bcrypt + httpOnly Cookie |
| AI | OpenAI API (gpt-4o-mini) |
| 代码编辑器 | Monaco Editor |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制并编辑 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="替换为一个随机字符串（至少32位）"
OPENAI_API_KEY="替换为你的 OpenAI API Key"
OPENAI_BASE_URL="https://api.openai.com/v1"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
npm run db:seed    # 填充评估题库（11道题）
```

### 4. 启动

```bash
npm run dev
```

访问 http://localhost:3000

> 低内存机器可用：`NODE_OPTIONS="--max-old-space-size=512" npm run dev`

## 项目结构

```
src/
├── app/
│   ├── page.tsx                    # 首页
│   ├── login/                      # 登录
│   ├── register/                   # 注册
│   ├── dashboard/                  # 学习仪表盘
│   ├── goals/                      # 学习目标
│   │   ├── new/                    # 创建目标
│   │   └── [goalId]/
│   │       ├── assessment/         # 能力评估
│   │       ├── plan/               # 学习路线
│   │       ├── documents/          # 学习文档
│   │       ├── exercises/          # 练习题 + 代码编辑器
│   │       └── history/            # 学习历史
│   └── api/                        # 18 个 API 路由
├── components/ui/                  # shadcn/ui 组件
├── hooks/                          # React hooks
├── lib/
│   ├── auth.ts                     # JWT 认证
│   ├── db.ts                       # Prisma 客户端
│   └── ai/
│       ├── client.ts               # OpenAI 封装
│       └── agents/                 # 5 个 AI Agent
└── types/                          # TypeScript 类型
```

## AI Agent

项目包含 5 个专职 AI Agent：

| Agent | 职责 |
|-------|------|
| Assessment Agent | 分析答题记录，生成能力等级和强弱项 |
| Learning Plan Agent | 根据能力画像生成分阶段学习计划 |
| Document Agent | 生成"源语言 vs 目标语言"对照式学习文档 |
| Exercise Agent | 根据主题和难度生成练习题 |
| Code Feedback Agent | 分析代码是否带着旧语言思维，建议新语言的惯用写法 |

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run db:seed` | 填充种子数据 |
| `npx prisma migrate dev` | 运行数据库迁移 |
| `npx prisma studio` | 打开数据库可视化工具 |

## 已知限制

- MVP 阶段仅支持 C → Python 路径
- 不真实执行用户代码，仅通过 AI 分析
- 使用 SQLite，适合开发，生产环境建议迁移到 PostgreSQL
- 需要有效的 OpenAI API Key 才能使用 AI 功能

## License

MIT
