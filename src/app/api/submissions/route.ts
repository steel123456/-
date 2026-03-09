import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取提交记录
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const studentId = searchParams.get("studentId");

    let query = client
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId);
    }

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取提交记录失败:", error);
      return NextResponse.json(
        { error: "获取提交记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: data });
  } catch (error) {
    console.error("获取提交记录错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 提交作业
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

    const client = getSupabaseClient();

    // 检查是否已经提交过
    const { data: existing } = await client
      .from("submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "您已经提交过该作业" },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from("submissions")
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        student_name: studentName,
        content_type: contentType,
        content: content || null,
        file_key: fileKey || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("提交作业失败:", error);
      return NextResponse.json(
        { error: "提交作业失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ submission: data });
  } catch (error) {
    console.error("提交作业错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
