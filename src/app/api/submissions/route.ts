import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, createSubmission } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const studentId = searchParams.get("studentId");

    const filters: any = {};
    if (assignmentId) filters.assignment_id = assignmentId;
    if (studentId) filters.student_id = studentId;

    const submissions = await getSubmissions(filters);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("获取提交记录错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assignmentId,
      studentId,
      studentName,
      contentType,
      content,
      fileKey,
    } = body;

    if (!assignmentId || !studentId || !contentType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (contentType === "text" && !content) {
      return NextResponse.json(
        { error: "请输入作业内容" },
        { status: 400 }
      );
    }

    if (contentType === "image" && !fileKey) {
      return NextResponse.json(
        { error: "请上传作业图片" },
        { status: 400 }
      );
    }

    try {
      const submission = await createSubmission({
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: studentName,
        content_type: contentType,
        content: content || undefined,
        file_key: fileKey || undefined,
      });

      return NextResponse.json({ submission });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "提交失败" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("提交作业错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
