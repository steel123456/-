import { NextRequest, NextResponse } from "next/server";
import { getAssignmentById } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await getAssignmentById(id);

    if (!assignment) {
      return NextResponse.json(
        { error: "作业不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("获取作业详情错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
