import { chatCompletionJSON } from "../client";
import type { GeneratedExercise } from "@/types/learning";

interface ExerciseInput {
  sourceLanguage: string;
  targetLanguage: string;
  topic: string;
  level: string;
  weaknesses: string[];
}

export async function runExerciseAgent(
  input: ExerciseInput
): Promise<GeneratedExercise[]> {
  const systemPrompt = `你是一个编程练习生成 Agent。你需要根据学习主题和用户能力生成练习题。

请输出 JSON 格式：
{
  "exercises": [
    {
      "title": "练习标题",
      "description": "练习描述，说明要做什么",
      "difficulty": "easy" | "medium" | "hard",
      "starterCode": "起始代码",
      "expectedOutput": "期望输出描述",
      "learningPurpose": "这道题的学习目的"
    }
  ]
}

请生成 3 道练习题。`;

  const userPrompt = `用户已有语言：${input.sourceLanguage}
目标语言：${input.targetLanguage}
当前主题：${input.topic}
用户能力等级：${input.level}
用户薄弱点：${input.weaknesses.join(", ") || "暂无"}

请生成 3 道练习题，难度从易到难。`;

  const result = await chatCompletionJSON<{ exercises: GeneratedExercise[] }>(
    systemPrompt,
    userPrompt
  );

  return result.exercises;
}
