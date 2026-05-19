import { chatCompletionJSON } from "../client";
import type { AssessmentResult } from "@/types/learning";

interface AssessmentInput {
  sourceLanguage: string;
  targetLanguage: string;
  answers: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string | null;
    isCorrect: boolean | null;
  }[];
  userDescription?: string;
}

export async function runAssessmentAgent(
  input: AssessmentInput
): Promise<AssessmentResult> {
  const systemPrompt = `你是一个编程教育能力评估 Agent。你需要根据用户的答题结果和自述背景，评估用户对已有编程语言的掌握程度，以及学习目标语言的准备情况。

请输出 JSON 格式：
{
  "level": "beginner" | "basic" | "intermediate" | "advanced",
  "strengths": ["强项1", "强项2"],
  "weaknesses": ["弱项1", "弱项2"],
  "summary": "评估总结"
}`;

  const answersText = input.answers
    .map(
      (a, i) =>
        `${i + 1}. [${a.isCorrect ? "正确" : "错误"}] ${a.question}\n用户回答: ${a.userAnswer}${a.correctAnswer ? `\n正确答案: ${a.correctAnswer}` : ""}`
    )
    .join("\n\n");

  const userPrompt = `用户已有语言：${input.sourceLanguage}
目标语言：${input.targetLanguage}
${input.userDescription ? `用户自述：${input.userDescription}` : ""}

用户答题记录：
${answersText}

请评估用户的能力等级、强项、弱项，并给出学习建议。`;

  return chatCompletionJSON<AssessmentResult>(systemPrompt, userPrompt);
}
