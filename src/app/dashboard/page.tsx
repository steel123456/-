"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Users, FileCheck, BarChart2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const isTeacher = user.role === "teacher";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">蔡小作业平台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">欢迎，</span>
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {isTeacher ? "老师" : "学生"}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile">个人信息</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isTeacher ? "教师工作台" : "学生作业中心"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isTeacher ? "管理作业、查看学生提交情况" : "查看作业、提交作业、查看批改结果"}
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isTeacher ? (
            <>
              {/* 老师功能 */}
              <Link href="/assignments/create">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">发布作业</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>创建新的作业任务</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/assignments">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <FileCheck className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle className="text-lg">作业管理</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>查看和管理已发布的作业</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/submissions">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Users className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">学生提交</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>查看学生作业提交情况</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/statistics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <BarChart2 className="h-8 w-8 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">统计分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>作业完成情况和成绩统计</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              {/* 学生功能 */}
              <Link href="/assignments">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">查看作业</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>查看老师发布的作业</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/submissions">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <FileCheck className="h-8 w-8 text-green-600 mb-2" />
                    <CardTitle className="text-lg">我的提交</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>查看已提交的作业</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/statistics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <BarChart2 className="h-8 w-8 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">我的成绩</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>查看作业成绩统计</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* 最近作业 */}
        <Card>
          <CardHeader>
            <CardTitle>最近作业</CardTitle>
            <CardDescription>
              {isTeacher ? "最近发布的作业" : "最近需要完成的作业"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无作业数据</p>
              {isTeacher && (
                <Button className="mt-4" asChild>
                  <Link href="/assignments/create">发布第一个作业</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
