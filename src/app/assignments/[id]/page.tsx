"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, User, Upload, FileText, CheckCircle } from "lucide-react";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<"text" | "image">("text");
  const [content, setContent] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      // 获取作业详情
      const assignmentRes = await fetch(`/api/assignments/${params.id}`);
      if (assignmentRes.ok) {
        const data = await assignmentRes.json();
        setAssignment(data.assignment);
      }

      // 检查是否已提交
      if (user?.role === "student") {
        const submissionRes = await fetch(
          `/api/submissions?assignmentId=${params.id}&studentId=${user.id}`
        );
        if (submissionRes.ok) {
          const data = await submissionRes.json();
          if (data.submissions && data.submissions.length > 0) {
            setSubmission(data.submissions[0]);
          }
        }
      }
    } catch (error) {
      console.error("获取作业详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFileKey(data.fileKey);
        setFileUrl(data.fileUrl);
      } else {
        setError(data.error || "上传失败");
      }
    } catch (error) {
      console.error("上传文件失败:", error);
      setError("上传文件失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content && !fileKey) {
      setError("请输入作业内容或上传作业图片");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: params.id,
          studentId: user?.id,
          studentName: user?.name,
          contentType,
          content: contentType === "text" ? content : null,
          fileKey: contentType === "image" ? fileKey : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }

      // 提交成功后，触发自动批改
      await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: data.submission.id }),
      });

      router.push("/submissions");
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
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

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">作业不存在</p>
          <Button className="mt-4" asChild>
            <Link href="/assignments">返回作业列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(assignment.deadline);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/assignments" className="text-blue-600 hover:underline">
            ← 返回作业列表
          </Link>
        </div>

        {/* 作业详情 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {assignment.teacher_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    截止时间: {formatDate(assignment.deadline)}
                  </span>
                </CardDescription>
              </div>
              <Badge variant={overdue ? "destructive" : "default"}>
                {overdue ? "已截止" : "进行中"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{assignment.description}</pre>
            </div>
          </CardContent>
        </Card>

        {/* 学生提交区域 */}
        {user?.role === "student" && !submission && !overdue && (
          <Card>
            <CardHeader>
              <CardTitle>提交作业</CardTitle>
              <CardDescription>选择文字输入或上传图片</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={contentType === "text" ? "default" : "outline"}
                      onClick={() => setContentType("text")}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      文字输入
                    </Button>
                    <Button
                      type="button"
                      variant={contentType === "image" ? "default" : "outline"}
                      onClick={() => setContentType("image")}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      上传图片
                    </Button>
                  </div>

                  {contentType === "text" ? (
                    <div className="space-y-2">
                      <Label htmlFor="content">作业内容</Label>
                      <Textarea
                        id="content"
                        placeholder="请输入作业内容..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">上传作业图片</Label>
                        <input
                          id="file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full"
                        />
                      </div>
                      {fileUrl && (
                        <div className="mt-4">
                          <img
                            src={fileUrl}
                            alt="作业图片"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "提交中..." : "提交作业"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 已提交提示 */}
        {submission && (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-gray-900">您已提交作业</p>
              <p className="text-sm text-gray-500 mt-2">
                提交时间: {formatDate(submission.submitted_at)}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/submissions">查看我的提交</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 已截止提示 */}
        {user?.role === "student" && !submission && overdue && (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium text-gray-900">作业已截止</p>
              <p className="text-sm text-gray-500 mt-2">无法提交</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
