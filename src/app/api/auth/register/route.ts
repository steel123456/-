import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, className } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (role !== "teacher" && role !== "student") {
      return NextResponse.json(
        { error: "角色必须是老师或学生" },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    const user = await createUser({
      email,
      name,
      role,
      class_name: className || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        className: user.class_name,
      },
    });
  } catch (error: any) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: error.message || "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
