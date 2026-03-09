import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { S3Storage } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: "缺少提交ID" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取提交记录
    const { data: submission, error: submissionError } = await client
      .from("submissions")
      .select("*, assignments(*)")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "提交记录不存在" },
        { status: 404 }
      );
    }

    // 获取作业信息
    const assignment = submission.assignments;

    // 准备批改内容
    let studentAnswer = "";

    if (submission.content_type === "text") {
      studentAnswer = submission.content;
    } else if (submission.content_type === "image" && submission.file_key) {
      // 获取图片URL
      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: "",
        secretKey: "",
        bucketName: process.env.COZE_BUCKET_NAME,
        region: "cn-beijing",
      });

      const imageUrl = await storage.generatePresignedUrl({
        key: submission.file_key,
        expireTime: 3600,
      });

      // 使用 vision 模型识别图片内容
      const visionClient = new LLMClient(new Config());
      const visionMessages = [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: "请识别这张图片中的文字内容，这是学生提交的作业。请完整准确地提取所有文字。",
            },
            {
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
                detail: "high" as const,
              },
            },
          ],
        },
      ];

      const visionResponse = await visionClient.invoke(visionMessages, {
        model: "doubao-seed-1-6-vision-250815",
        temperature: 0.3,
      });

      studentAnswer = visionResponse.content;
    }

    // 使用 LLM 批改作业
    const llmClient = new LLMClient(new Config());
    const gradingPrompt = `你是一位经验丰富的老师，请批改以下学生作业。

作业题目：
${assignment.description}

学生答案：
${studentAnswer}

请按照以下格式输出批改结果：

【评分】（0-100分）
【是否合格】（合格/不合格，60分及以上为合格）
【批改意见】（详细说明批改理由，指出优点和不足）

请确保输出格式规范，评分合理。`;

    const messages = [
      {
        role: "system" as const,
        content: "你是一位专业的老师，擅长批改学生作业并给出建设性的反馈。",
      },
      {
        role: "user" as const,
        content: gradingPrompt,
      },
    ];

    const gradingResponse = await llmClient.invoke(messages, {
      temperature: 0.5,
    });

    const feedback = gradingResponse.content;

    // 解析评分
    let score = 60;
    let isPassed = true;

    const scoreMatch = feedback.match(/【评分】[：:]\s*(\d+)/);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
      isPassed = score >= 60;
    }

    // 更新提交记录
    const { error: updateError } = await client
      .from("submissions")
      .update({
        auto_score: score,
        feedback,
        status: "graded",
        is_passed: isPassed,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("更新提交记录失败:", updateError);
      return NextResponse.json(
        { error: "更新批改结果失败" },
        { status: 500 }
      );
    }

    // 更新作业统计
    await updateAssignmentStats(client, assignment.id);

    return NextResponse.json({
      success: true,
      score,
      feedback,
      isPassed,
    });
  } catch (error) {
    console.error("批改作业错误:", error);
    return NextResponse.json(
      { error: "批改作业失败" },
      { status: 500 }
    );
  }
}

// 更新作业统计信息
async function updateAssignmentStats(client: any, assignmentId: string) {
  try {
    // 获取该作业的所有提交
    const { data: submissions } = await client
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId);

    if (!submissions || submissions.length === 0) {
      return;
    }

    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter((s: any) => s.status === "graded");
    const passedCount = gradedSubmissions.filter((s: any) => s.is_passed).length;
    const failedCount = gradedSubmissions.length - passedCount;

    // 计算平均分
    const scores = gradedSubmissions
      .map((s: any) => s.auto_score)
      .filter((score: number) => score !== null);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : null;

    // 更新作业统计
    await client
      .from("assignments")
      .update({
        total_submissions: totalSubmissions,
        passed_count: passedCount,
        failed_count: failedCount,
        average_score: averageScore,
      })
      .eq("id", assignmentId);
  } catch (error) {
    console.error("更新作业统计失败:", error);
  }
}
