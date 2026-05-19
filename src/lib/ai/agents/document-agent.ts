import { chatCompletion } from "../client";

interface DocumentInput {
  sourceLanguage: string;
  targetLanguage: string;
  topic: string;
  userWeaknesses: string[];
}

export async function runDocumentAgent(
  input: DocumentInput
): Promise<string> {
  const systemPrompt = `你是一个编程语言迁移学习文档生成 Agent。你需要生成"已有语言 → 目标语言"的对照式学习文档。

文档要求：
1. 先解释目标语言概念
2. 再说明它与已有语言中的相关概念有什么相似点
3. 重点说明差异（用表格对比）
4. 指出已有语言学习者常见误区
5. 给出代码对比示例（C 代码 vs Python 代码）
6. 给出 2-3 道练习题

使用 Markdown 格式输出。`;

  const userPrompt = `用户已有语言：${input.sourceLanguage}
目标语言：${input.targetLanguage}
当前主题：${input.topic}
用户薄弱点：${input.userWeaknesses.join(", ") || "暂无"}

请生成一份面向该用户的学习文档。`;

  return chatCompletion(systemPrompt, userPrompt);
}
