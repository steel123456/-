import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取作业列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");

    let query = client
      .from("assignments")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("获取作业列表失败:", error);
      return NextResponse.json(
        { error: "获取作业列表失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ assignments: data });
  } catch (error) {
    console.error("获取作业列表错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 创建新作业
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, deadline, teacherId, teacherName } = body;

    if (!title || !description || !deadline || !teacherId) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from("assignments")
      .insert({
        title,
        description,
        deadline,
        teacher_id: teacherId,
        teacher_name: teacherName,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("创建作业失败:", error);
      return NextResponse.json(
        { error: "创建作业失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ assignment: data });
  } catch (error) {
    console.error("创建作业错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
