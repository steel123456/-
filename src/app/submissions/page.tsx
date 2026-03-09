"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  assignment_id: string;
  student_name: string;
  content_type: string;
  content: string;
  file_key: string;
  auto_score: number;
  feedback: string;
  status: string;
  is_passed: boolean;
  submitted_at: string;
  graded_at: string;
  assignments: {
    title: string;
    deadline: string;
  };
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.role === "student") {
        params.append("studentId", user.id);
      }

      const response = await fetch(
        `/api/submissions?${params}&includeAssignment=true`
      );
      const data = await response.json();

      if (response.ok) {
        // 获取作业详情
        const submissionsWithAssignments = await Promise.all(
          (data.submissions || []).map(async (submission: any) => {
            const assignmentRes = await fetch(
              `/api/assignments/${submission.assignment_id}`
            );
            const assignmentData = await assignmentRes.json();
            return {
              ...submission,
              assignments: assignmentData.assignment,
            };
          })
        );
        setSubmissions(submissionsWithAssignments);
      }
    } catch (error) {
      console.error("获取提交记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === "teacher" ? "学生提交记录" : "我的提交记录"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {user?.role === "teacher"
              ? "查看学生的作业提交情况和批改结果"
              : "查看您的作业提交记录和批改结果"}
          </p>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无提交记录</p>
              {user?.role === "student" && (
                <Button className="mt-4" asChild>
                  <Link href="/assignments">查看作业</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {submission.assignments?.title || "未知作业"}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {user?.role === "teacher" && (
                          <span className="mr-4">学生: {submission.student_name}</span>
                        )}
                        提交时间: {formatDate(submission.submitted_at)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {submission.status === "pending" ? (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          批改中
                        </Badge>
                      ) : submission.is_passed ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          合格
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          不合格
                        </Badge>
                      )}
                      {submission.auto_score !== null && (
                        <span className="text-2xl font-bold text-blue-600">
                          {submission.auto_score}分
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 显示提交内容 */}
                    {submission.content_type === "text" && (
                      <div>
                        <h4 className="font-medium mb-2">提交内容:</h4>
                        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                          {submission.content}
                        </pre>
                      </div>
                    )}

                    {submission.content_type === "image" && submission.file_key && (
                      <div>
                        <h4 className="font-medium mb-2">提交图片:</h4>
                        <SubmissionImage fileKey={submission.file_key} />
                      </div>
                    )}

                    {/* 显示批改反馈 */}
                    {submission.feedback && (
                      <div>
                        <h4 className="font-medium mb-2">批改意见:</h4>
                        <pre className="whitespace-pre-wrap bg-blue-50 p-4 rounded-lg text-sm">
                          {submission.feedback}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// 图片组件
function SubmissionImage({ fileKey }: { fileKey: string }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImageUrl();
  }, [fileKey]);

  const fetchImageUrl = async () => {
    try {
      const response = await fetch(`/api/file-url?key=${fileKey}`);
      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error("获取图片URL失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">加载图片中...</div>;
  }

  if (!imageUrl) {
    return <div className="text-gray-500">图片加载失败</div>;
  }

  return (
    <img
      src={imageUrl}
      alt="作业图片"
      className="max-w-full h-auto rounded-lg border"
      style={{ maxHeight: "400px" }}
    />
  );
}
