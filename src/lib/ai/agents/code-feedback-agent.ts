import { chatCompletion } from "../client";

interface CodeFeedbackInput {
  sourceLanguage: string;
  targetLanguage: string;
  exerciseDescription: string;
  code: string;
  weaknesses: string[];
}

export async function runCodeFeedbackAgent(
  input: CodeFeedbackInput
): Promise<string> {
  const systemPrompt = `你是一个编程学习代码反馈 Agent。你需要分析用户提交的代码，并给出详细的反馈。

分析要求：
1. 代码是否满足题目要求
2. 是否存在语法或逻辑问题
3. 是否体现出旧语言思维（如 C 语言风格的循环写法）
4. 如何改写成更符合目标语言风格的代码
5. 后续学习建议

请用结构化 Markdown 输出，包含代码示例。`;

  const userPrompt = `用户已有语言：${input.sourceLanguage}
目标语言：${input.targetLanguage}
练习题：${input.exerciseDescription}
用户薄弱点：${input.weaknesses.join(", ") || "暂无"}

用户提交的代码：
\`\`\`${input.targetLanguage.toLowerCase()}
${input.code}
\`\`\`

请分析这段代码并给出反馈。`;

  return chatCompletion(systemPrompt, userPrompt);
}
