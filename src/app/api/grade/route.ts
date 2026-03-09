import { NextRequest, NextResponse } from "next/server";
import { getSubmissionById, updateSubmission, getAssignmentById } from "@/lib/db";
import { LLMClient, Config } from "coze-coding-dev-sdk";
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

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json(
        { error: "提交记录不存在" },
        { status: 404 }
      );
    }

    const assignment = await getAssignmentById(submission.assignment_id);

    if (!assignment) {
      return NextResponse.json(
        { error: "作业不存在" },
        { status: 404 }
      );
    }

    let studentAnswer = "";

    if (submission.content_type === "text") {
      studentAnswer = submission.content || "";
    } else if (submission.content_type === "image" && submission.file_key) {
      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || "",
        accessKey: "",
        secretKey: "",
        bucketName: process.env.COZE_BUCKET_NAME || "",
        region: "cn-beijing",
      });

      const imageUrl = await storage.generatePresignedUrl({
        key: submission.file_key,
        expireTime: 3600,
      });

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

    let score = 60;
    let isPassed = true;

    const scoreMatch = feedback.match(/【评分】[：:]\s*(\d+)/);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
      isPassed = score >= 60;
    }

    await updateSubmission(submissionId, {
      auto_score: score,
      feedback,
      status: "graded",
      is_passed: isPassed,
      graded_at: new Date().toISOString(),
    });

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
