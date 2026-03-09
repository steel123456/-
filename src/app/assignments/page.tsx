"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Clock, User } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  teacher_name: string;
  status: string;
  total_submissions: number;
  created_at: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
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
      console.error("获取作业列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">作业列表</h2>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === "teacher" ? "您发布的作业" : "需要完成的作业"}
            </p>
          </div>
          {user?.role === "teacher" && (
            <Button asChild>
              <Link href="/assignments/create">发布作业</Link>
            </Button>
          )}
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无作业</p>
              {user?.role === "teacher" && (
                <Button className="mt-4" asChild>
                  <Link href="/assignments/create">发布第一个作业</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {assignment.teacher_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(assignment.deadline)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={isOverdue(assignment.deadline) ? "destructive" : "default"}>
                        {isOverdue(assignment.deadline) ? "已截止" : "进行中"}
                      </Badge>
                      {user?.role === "teacher" && (
                        <span className="text-sm text-gray-500">
                          已提交: {assignment.total_submissions || 0} 人
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                  <Button asChild>
                    <Link href={`/assignments/${assignment.id}`}>
                      {user?.role === "teacher" ? "查看详情" : "查看并提交"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
