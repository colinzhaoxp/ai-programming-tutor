# AI 个性化编程语言学习平台 - 项目总结

## 1. 项目简介

一个基于 AI Agent 的个性化编程语言迁移学习平台。MVP 阶段聚焦场景：**用户已有 C 语言基础，希望学习 Python**。

平台根据学习者已有的编程语言基础、目标学习语言、能力评估结果和历史学习记录，自动生成个性化学习计划、对照式学习文档、练习题和代码反馈。

---

## 2. 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.6 |
| 语言 | TypeScript | 5.x |
| UI | React + shadcn/ui + Tailwind CSS | 19.2.4 |
| 数据库 | SQLite (Prisma ORM) | 6.19.3 |
| 认证 | JWT (jsonwebtoken + bcryptjs) | - |
| AI | OpenAI API (gpt-4o-mini) | 6.38.0 |
| 代码编辑器 | Monaco Editor | 4.7.0 |
| Markdown | react-markdown + remark-gfm | 10.1.0 |

---

## 3. 项目结构

```
ai-language-learning-platform/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义（13个模型）
│   ├── seed.ts                # 评估题库种子数据（11道题）
│   └── migrations/            # 数据库迁移文件
│
├── src/
│   ├── app/
│   │   ├── page.tsx                           # 首页
│   │   ├── layout.tsx                         # 根布局
│   │   ├── globals.css                        # 全局样式
│   │   │
│   │   ├── login/page.tsx                     # 登录页
│   │   ├── register/page.tsx                  # 注册页
│   │   ├── dashboard/page.tsx                 # 学习仪表盘
│   │   │
│   │   ├── goals/
│   │   │   ├── new/page.tsx                   # 创建学习目标
│   │   │   └── [goalId]/
│   │   │       ├── page.tsx                   # 目标详情
│   │   │       ├── assessment/page.tsx        # 能力评估
│   │   │       ├── plan/page.tsx              # 学习路线
│   │   │       ├── documents/page.tsx         # 学习文档
│   │   │       ├── exercises/page.tsx         # 练习题 + Monaco Editor
│   │   │       └── history/page.tsx           # 学习历史
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts          # POST 注册
│   │       │   ├── login/route.ts             # POST 登录
│   │       │   ├── logout/route.ts            # POST 登出
│   │       │   └── me/route.ts                # GET 当前用户
│   │       │
│   │       ├── learning-goals/
│   │       │   ├── route.ts                   # GET 列表 / POST 创建
│   │       │   └── [id]/
│   │       │       ├── route.ts               # GET 详情
│   │       │       ├── documents/route.ts     # GET 文档列表
│   │       │       ├── exercises/route.ts     # GET 练习列表
│   │       │       ├── events/route.ts        # GET 学习事件
│   │       │       └── skill-profile/route.ts # GET 能力画像
│   │       │
│   │       ├── assessments/
│   │       │   ├── route.ts                   # POST 提交评估
│   │       │   └── questions/route.ts         # GET 评估题库
│   │       │
│   │       ├── learning-plans/
│   │       │   └── generate/route.ts          # POST 生成学习计划
│   │       │
│   │       ├── documents/
│   │       │   ├── generate/route.ts          # POST 生成文档
│   │       │   └── [id]/route.ts              # GET 查看文档
│   │       │
│   │       ├── exercises/
│   │       │   ├── generate/route.ts          # POST 生成练习题
│   │       │   ├── [id]/route.ts              # GET 练习详情
│   │       │   └── [id]/submissions/route.ts  # GET 提交历史
│   │       │
│   │       └── code-submissions/
│   │           └── route.ts                   # POST 提交代码 + AI 反馈
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.tsx                     # 全局导航栏
│   │   └── ui/                                # shadcn/ui 组件（14个）
│   │
│   ├── hooks/
│   │   └── use-auth.ts                        # 认证状态 hook
│   │
│   ├── lib/
│   │   ├── auth.ts                            # JWT 工具（签发/验证/Cookie）
│   │   ├── db.ts                              # Prisma 客户端单例
│   │   ├── utils.ts                           # shadcn/ui 工具函数
│   │   └── ai/
│   │       ├── client.ts                      # OpenAI 客户端封装
│   │       └── agents/
│   │           ├── assessment-agent.ts        # 能力评估 Agent
│   │           ├── learning-plan-agent.ts     # 学习计划 Agent
│   │           ├── document-agent.ts          # 文档生成 Agent
│   │           ├── exercise-agent.ts          # 练习题生成 Agent
│   │           └── code-feedback-agent.ts     # 代码反馈 Agent
│   │
│   ├── types/
│   │   └── learning.ts                        # TypeScript 类型定义
│   │
│   └── generated/prisma/                      # Prisma 自动生成的客户端
│
├── .env                                       # 环境变量
├── package.json
├── tsconfig.json
├── CLAUDE.md                                  # 项目开发规范
└── PROJECT.md                                 # 本文件
```

---

## 4. 数据库模型（13个）

| 模型 | 用途 |
|------|------|
| `User` | 用户账号（email, passwordHash, username） |
| `UserProfile` | 用户画像（已学语言、目标语言、学习目的） |
| `LearningGoal` | 学习目标（源语言 → 目标语言） |
| `Assessment` | 评估记录（分数、等级、强项、弱项、AI 总结） |
| `AssessmentQuestion` | 评估题库（选择题/简答题） |
| `AssessmentAnswer` | 用户答题记录 |
| `SkillProfile` | 能力画像（主题 + 掌握度 0-100） |
| `LearningPlan` | 学习计划 |
| `LearningPlanStage` | 学习阶段（顺序、主题、状态、预计学时） |
| `LearningDocument` | 学习文档（Markdown 格式） |
| `Exercise` | 练习题（标题、描述、难度、起始代码） |
| `CodeSubmission` | 代码提交记录 + AI 反馈 |
| `LearningEvent` | 学习事件日志 |

所有业务表都包含 `userId`，实现用户数据隔离。

---

## 5. 核心用户流程

```
注册/登录
  → 创建学习目标（C → Python）
  → 完成能力评估（11道题）
  → AI 生成能力画像（强项/弱项/掌握度）
  → AI 生成个性化学习路线（6-8个阶段）
  → 查看对照式学习文档（C vs Python）
  → 在 Monaco Editor 中完成练习题
  → 提交代码获取 AI 反馈
  → 查看学习历史时间线
```

---

## 6. AI Agent 设计（5个）

所有 Agent 统一封装在 `src/lib/ai/agents/` 下，通过 `src/lib/ai/client.ts` 调用 OpenAI API。

### 6.1 Assessment Agent
- **输入**：用户答题记录 + 自述背景
- **输出**：能力等级、强项、弱项、学习建议（JSON）
- **用途**：评估完成后生成能力画像

### 6.2 Learning Plan Agent
- **输入**：能力画像 + 评估总结
- **输出**：分阶段学习计划（JSON，含 6-8 个阶段）
- **用途**：生成个性化学习路线

### 6.3 Document Agent
- **输入**：源语言、目标语言、主题、用户薄弱点
- **输出**：Markdown 格式对照式学习文档
- **用途**：生成"已有语言 → 目标语言"的学习文档

### 6.4 Exercise Agent
- **输入**：主题、能力等级、薄弱点
- **输出**：3道练习题（JSON，含标题、描述、难度、起始代码）
- **用途**：生成个性化练习题

### 6.5 Code Feedback Agent
- **输入**：练习描述、用户代码、薄弱点
- **输出**：结构化 Markdown 反馈
- **用途**：分析代码是否体现 C 语言思维，建议 Pythonic 写法

---

## 7. API 路由总览（18个）

### 认证（4个）
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |

### 学习目标（7个）
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/learning-goals` | 目标列表 |
| POST | `/api/learning-goals` | 创建目标 |
| GET | `/api/learning-goals/:id` | 目标详情（含评估、计划、能力画像） |
| GET | `/api/learning-goals/:id/documents` | 文档列表 |
| GET | `/api/learning-goals/:id/exercises` | 练习列表 |
| GET | `/api/learning-goals/:id/events` | 学习事件 |
| GET | `/api/learning-goals/:id/skill-profile` | 能力画像 |

### 评估（2个）
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/assessments/questions` | 获取题库 |
| POST | `/api/assessments` | 提交评估（调用 Assessment Agent） |

### 学习计划（1个）
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/learning-plans/generate` | 生成计划（调用 Learning Plan Agent） |

### 文档（2个）
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/documents/generate` | 生成文档（调用 Document Agent） |
| GET | `/api/documents/:id` | 查看文档 |

### 练习题（3个）
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/exercises/generate` | 生成练习（调用 Exercise Agent） |
| GET | `/api/exercises/:id` | 练习详情 |
| GET | `/api/exercises/:id/submissions` | 提交历史 |

### 代码提交（1个）
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/code-submissions` | 提交代码（调用 Code Feedback Agent） |

---

## 8. 页面总览（9个）

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 项目介绍 + 入口 |
| 注册 | `/register` | 邮箱注册 |
| 登录 | `/login` | 邮箱登录 |
| 仪表盘 | `/dashboard` | 学习目标列表 + 快速入口 |
| 创建目标 | `/goals/new` | 表单：源语言、目标语言、学习目的 |
| 目标详情 | `/goals/:id` | 能力评估、学习进度、能力画像、快速操作 |
| 能力评估 | `/goals/:id/assessment` | 选择题 + 简答题 → AI 评估结果 |
| 学习路线 | `/goals/:id/plan` | 分阶段学习路线图 |
| 学习文档 | `/goals/:id/documents` | 左侧文档列表 + 右侧 Markdown 渲染 |
| 练习题 | `/goals/:id/exercises` | 左侧题目列表 + Monaco Editor + AI 反馈 |
| 学习历史 | `/goals/:id/history` | 事件时间线 |

---

## 9. 认证机制

- **方式**：JWT + httpOnly Cookie
- **密码**：bcryptjs 哈希存储
- **Token**：7天有效期，存储在 `auth-token` Cookie 中
- **中间件**：每个 API 路由通过 `getCurrentUser()` 验证登录态
- **数据隔离**：所有查询都带 `userId` 条件

---

## 10. 环境变量

```env
DATABASE_URL="file:./dev.db"           # SQLite 数据库路径
JWT_SECRET="your-jwt-secret"           # JWT 签名密钥（生产环境需修改）
OPENAI_API_KEY="your-openai-api-key"   # OpenAI API Key
OPENAI_BASE_URL="https://api.openai.com/v1"  # OpenAI API 地址
```

---

## 11. 启动方式

```bash
# 1. 进入项目目录
cd ai-language-learning-platform

# 2. 安装依赖（已完成则跳过）
npm install

# 3. 初始化数据库（已完成则跳过）
npx prisma migrate dev --name init

# 4. 填充种子数据（已完成则跳过）
npm run db:seed

# 5. 配置 .env 中的 OPENAI_API_KEY

# 6. 启动开发服务器
npm run dev

# 低内存机器建议：
NODE_OPTIONS="--max-old-space-size=512" npm run dev
```

访问 http://localhost:3000

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run db:seed` | 填充种子数据 |
| `npx prisma migrate dev` | 运行数据库迁移 |
| `npx prisma studio` | 打开数据库可视化工具 |

---

## 12. 代码统计

- **源代码文件**：约 40 个（不含 generated 和 ui 组件）
- **总代码行数**：约 3900 行
- **API 路由**：18 个
- **页面**：9 个
- **AI Agent**：5 个
- **数据库模型**：13 个
- **评估题库**：11 道题

---

## 13. 已知限制

1. **内存**：低内存机器上 `next build` 可能 OOM，建议使用 `npm run dev` 开发
2. **MVP 范围**：仅支持 C → Python 路径，不支持多语言切换
3. **代码执行**：不真实运行用户代码，仅做 AI 分析
4. **AI Key**：需要配置真实的 `OPENAI_API_KEY` 才能使用 AI 功能
5. **数据库**：使用 SQLite，适合开发，生产环境建议迁移到 PostgreSQL

---

## 14. 后续扩展方向

- 支持更多语言迁移路径（Java → Go, JavaScript → TypeScript 等）
- 真实代码沙箱执行
- 学习计划自动调整（Plan Adjustment Agent 已预留）
- CLI 工具 / VS Code 插件
- 迁移到 PostgreSQL
- 添加 OAuth 第三方登录
