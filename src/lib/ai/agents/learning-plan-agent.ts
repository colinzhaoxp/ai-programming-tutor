import { chatCompletionJSON } from "../client";
import type { GeneratedLearningPlan } from "@/types/learning";

interface LearningPlanInput {
  sourceLanguage: string;
  targetLanguage: string;
  skillProfile: { topic: string; masteryLevel: number }[];
  assessmentSummary: string;
}

export async function runLearningPlanAgent(
  input: LearningPlanInput
): Promise<GeneratedLearningPlan> {
  const systemPrompt = `你是一个个性化编程学习路径规划 Agent。你需要根据用户的能力画像和评估结果，生成一个分阶段的学习计划。

请输出 JSON 格式：
{
  "title": "学习计划标题",
  "description": "学习计划描述",
  "aiGeneratedReason": "为什么生成这个计划",
  "stages": [
    {
      "order": 1,
      "title": "阶段标题",
      "description": "阶段描述",
      "keyTopics": ["主题1", "主题2"],
      "estimatedHours": 3
    }
  ]
}`;

  const skillText = input.skillProfile
    .map((s) => `- ${s.topic}: ${s.masteryLevel}%`)
    .join("\n");

  const userPrompt = `用户已有语言：${input.sourceLanguage}
目标语言：${input.targetLanguage}

评估总结：${input.assessmentSummary}

能力画像：
${skillText || "暂无"}

请生成一个分阶段学习计划。要求：
1. 学习路线必须考虑用户已有语言基础
2. 每个阶段必须说明与已有语言的关系
3. 每个阶段需要包含 keyTopics、estimatedHours
4. 共 6-8 个阶段`;

  return chatCompletionJSON<GeneratedLearningPlan>(systemPrompt, userPrompt);
}
