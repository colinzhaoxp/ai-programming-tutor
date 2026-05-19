import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runAssessmentAgent } from "@/lib/ai/agents/assessment-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { learningGoalId, answers } = await request.json();

  if (!learningGoalId || !answers) {
    return Response.json(
      { error: "缺少必要参数" },
      { status: 400 }
    );
  }

  // Verify goal belongs to user
  const goal = await prisma.learningGoal.findFirst({
    where: { id: learningGoalId, userId: user.userId },
  });
  if (!goal) {
    return Response.json({ error: "目标不存在" }, { status: 404 });
  }

  // Get questions with correct answers
  const questionIds = answers.map((a: { questionId: string }) => a.questionId);
  const questions = await prisma.assessmentQuestion.findMany({
    where: { id: { in: questionIds } },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // Process answers
  const processedAnswers = answers.map(
    (a: { questionId: string; userAnswer: string }) => {
      const question = questionMap.get(a.questionId);
      const isCorrect = question?.answer
        ? a.userAnswer.trim().toLowerCase() ===
          question.answer.trim().toLowerCase()
        : null;
      return {
        questionId: a.questionId,
        question: question?.question || "",
        userAnswer: a.userAnswer,
        correctAnswer: question?.answer || null,
        isCorrect,
      };
    }
  );

  // Run assessment agent
  const result = await runAssessmentAgent({
    sourceLanguage: goal.sourceLanguage,
    targetLanguage: goal.targetLanguage,
    answers: processedAnswers,
  });

  // Calculate score
  const correctCount = processedAnswers.filter(
    (a: { isCorrect: boolean | null }) => a.isCorrect === true
  ).length;
  const score = Math.round(
    (correctCount / processedAnswers.length) * 100
  );

  // Save assessment
  const assessment = await prisma.assessment.create({
    data: {
      userId: user.userId,
      learningGoalId,
      sourceLanguage: goal.sourceLanguage,
      targetLanguage: goal.targetLanguage,
      score,
      level: result.level,
      strengths: JSON.stringify(result.strengths),
      weaknesses: JSON.stringify(result.weaknesses),
      aiSummary: result.summary,
      answers: {
        create: processedAnswers.map(
          (a: {
            questionId: string;
            userAnswer: string;
            isCorrect: boolean | null;
          }) => ({
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
          })
        ),
      },
    },
  });

  // Generate initial skill profiles from assessment
  const strengths: string[] = result.strengths;
  const weaknesses: string[] = result.weaknesses;

  // Create skill profiles for strengths (high mastery)
  for (const topic of strengths) {
    await prisma.skillProfile.create({
      data: {
        userId: user.userId,
        learningGoalId,
        language: goal.sourceLanguage,
        topic,
        masteryLevel: 80,
        evidence: JSON.stringify(["assessment_correct_answer"]),
      },
    });
  }

  // Create skill profiles for weaknesses (low mastery)
  for (const topic of weaknesses) {
    await prisma.skillProfile.create({
      data: {
        userId: user.userId,
        learningGoalId,
        language: goal.targetLanguage,
        topic,
        masteryLevel: 30,
        evidence: JSON.stringify(["assessment_weakness"]),
      },
    });
  }

  // Write learning event
  await prisma.learningEvent.create({
    data: {
      userId: user.userId,
      learningGoalId,
      eventType: "assessment_completed",
      eventData: JSON.stringify({
        assessmentId: assessment.id,
        level: result.level,
        score,
      }),
    },
  });

  return Response.json({
    assessment: {
      id: assessment.id,
      level: assessment.level,
      score: assessment.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      summary: result.summary,
    },
  });
}
