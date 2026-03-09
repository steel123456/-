import { NextRequest, NextResponse } from "next/server";
import { getAssignments, createAssignment } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");

    const filters: any = {};
    if (status) filters.status = status;
    if (teacherId) filters.teacher_id = teacherId;

    const assignments = await getAssignments(filters);

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("获取作业列表错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

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

    const assignment = await createAssignment({
      title,
      description,
      deadline,
      teacher_id: teacherId,
      teacher_name: teacherName,
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("创建作业错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
