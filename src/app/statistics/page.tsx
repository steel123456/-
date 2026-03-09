"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart2, CheckCircle, XCircle, Download, Star } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  total_submissions: number;
  passed_count: number;
  failed_count: number;
  average_score: number;
}

interface Submission {
  id: string;
  student_name: string;
  auto_score: number;
  is_passed: boolean;
  assignment_id: string;
}

export default function StatisticsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchStatistics();
  }, [user]);

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role === "teacher") {
        params.append("teacherId", user.id);
      }

      const response = await fetch(`/api/assignments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 计算总体统计
  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.total_submissions || 0),
    0
  );
  const totalPassed = assignments.reduce(
    (sum, a) => sum + (a.passed_count || 0),
    0
  );
  const totalFailed = assignments.reduce(
    (sum, a) => sum + (a.failed_count || 0),
    0
  );
  const passRate =
    totalSubmissions > 0
      ? Math.round((totalPassed / totalSubmissions) * 100)
      : 0;

  // 准备图表数据
  const barChartData = assignments.map((a) => ({
    name: a.title.substring(0, 10) + (a.title.length > 10 ? "..." : ""),
    合格: a.passed_count || 0,
    不合格: a.failed_count || 0,
  }));

  const pieChartData = [
    { name: "合格", value: totalPassed, color: "#10B981" },
    { name: "不合格", value: totalFailed, color: "#EF4444" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                蔡小作业平台
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">返回首页</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === "teacher" ? "统计分析" : "我的成绩"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {user?.role === "teacher"
              ? "查看作业完成情况和成绩统计"
              : "查看您的作业成绩统计"}
          </p>
        </div>

        {/* 总体统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>总作业数</CardDescription>
              <CardTitle className="text-3xl">{assignments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>总提交数</CardDescription>
              <CardTitle className="text-3xl">{totalSubmissions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>合格人数</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {totalPassed}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>合格率</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {passRate}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无统计数据</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>作业完成情况</CardTitle>
                  <CardDescription>各作业的合格与不合格人数对比</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="合格" fill="#10B981" />
                      <Bar dataKey="不合格" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>总体合格率</CardTitle>
                  <CardDescription>所有作业的合格情况分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 作业列表 */}
            <Card>
              <CardHeader>
                <CardTitle>作业详情</CardTitle>
                <CardDescription>各作业的完成情况统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            合格: {assignment.passed_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-500" />
                            不合格: {assignment.failed_count || 0}
                          </span>
                          {assignment.average_score && (
                            <span className="text-blue-600 font-medium">
                              平均分: {assignment.average_score}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/statistics/${assignment.id}`}>
                          查看详情
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
