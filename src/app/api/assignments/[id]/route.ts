import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("获取作业详情失败:", error);
      return NextResponse.json(
        { error: "作业不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ assignment: data });
  } catch (error) {
    console.error("获取作业详情错误:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
