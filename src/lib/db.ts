import { Redis } from "@upstash/redis";

// 初始化 Redis 客户端
function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  });
}

// 生成 UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============ 用户操作 ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "student";
  class_name?: string;
  avatar?: string;
  created_at: string;
}

export async function getUsers(): Promise<User[]> {
  const redis = getRedis();
  const users = await redis.get<User[]>("users");
  return users || [];
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

export async function createUser(data: {
  email: string;
  name: string;
  role: string;
  class_name?: string;
}): Promise<User> {
  const users = await getUsers();
  
  if (users.find((u) => u.email === data.email)) {
    throw new Error("该邮箱已被注册");
  }
  
  const user: User = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role as "teacher" | "student",
    class_name: data.class_name,
    created_at: new Date().toISOString(),
  };
  
  users.push(user);
  const redis = getRedis();
  await redis.set("users", users);
  return user;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...data };
  const redis = getRedis();
  await redis.set("users", users);
  return users[index];
}

// ============ 作业操作 ============

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  teacher_id: string;
  teacher_name: string;
  status: string;
  total_submissions: number;
  passed_count: number;
  failed_count: number;
  average_score: number | null;
  created_at: string;
}

export async function getAssignments(filters?: { teacher_id?: string; status?: string }): Promise<Assignment[]> {
  const redis = getRedis();
  const assignments = (await redis.get<Assignment[]>("assignments")) || [];
  
  let result = assignments;
  if (filters?.teacher_id) {
    result = result.filter((a) => a.teacher_id === filters.teacher_id);
  }
  if (filters?.status) {
    result = result.filter((a) => a.status === filters.status);
  }
  
  return result.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  const assignments = await getAssignments();
  return assignments.find((a) => a.id === id) || null;
}

export async function createAssignment(data: {
  title: string;
  description: string;
  deadline: string;
  teacher_id: string;
  teacher_name: string;
}): Promise<Assignment> {
  const assignments = await getAssignments();
  
  const assignment: Assignment = {
    id: generateId(),
    title: data.title,
    description: data.description,
    deadline: data.deadline,
    teacher_id: data.teacher_id,
    teacher_name: data.teacher_name,
    status: "active",
    total_submissions: 0,
    passed_count: 0,
    failed_count: 0,
    average_score: null,
    created_at: new Date().toISOString(),
  };
  
  assignments.push(assignment);
  const redis = getRedis();
  await redis.set("assignments", assignments);
  return assignment;
}

export async function updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment | null> {
  const redis = getRedis();
  const assignments = (await redis.get<Assignment[]>("assignments")) || [];
  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  
  assignments[index] = { ...assignments[index], ...data };
  await redis.set("assignments", assignments);
  return assignments[index];
}

// ============ 提交记录操作 ============

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  content_type: "text" | "image";
  content?: string;
  file_key?: string;
  auto_score: number | null;
  feedback?: string;
  status: "pending" | "graded";
  is_passed: boolean;
  submitted_at: string;
  graded_at?: string;
}

export async function getSubmissions(filters?: {
  assignment_id?: string;
  student_id?: string;
}): Promise<Submission[]> {
  const redis = getRedis();
  const submissions = (await redis.get<Submission[]>("submissions")) || [];
  
  let result = submissions;
  if (filters?.assignment_id) {
    result = result.filter((s) => s.assignment_id === filters.assignment_id);
  }
  if (filters?.student_id) {
    result = result.filter((s) => s.student_id === filters.student_id);
  }
  
  return result.sort((a, b) => 
    new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const submissions = await getSubmissions();
  return submissions.find((s) => s.id === id) || null;
}

export async function createSubmission(data: {
  assignment_id: string;
  student_id: string;
  student_name: string;
  content_type: "text" | "image";
  content?: string;
  file_key?: string;
}): Promise<Submission> {
  const redis = getRedis();
  const submissions = (await redis.get<Submission[]>("submissions")) || [];
  
  const existing = submissions.find(
    (s) => s.assignment_id === data.assignment_id && s.student_id === data.student_id
  );
  if (existing) {
    throw new Error("您已经提交过该作业");
  }
  
  const submission: Submission = {
    id: generateId(),
    assignment_id: data.assignment_id,
    student_id: data.student_id,
    student_name: data.student_name,
    content_type: data.content_type,
    content: data.content,
    file_key: data.file_key,
    auto_score: null,
    status: "pending",
    is_passed: false,
    submitted_at: new Date().toISOString(),
  };
  
  submissions.push(submission);
  await redis.set("submissions", submissions);
  
  // 更新作业统计
  await updateAssignmentStats(data.assignment_id);
  
  return submission;
}

export async function updateSubmission(id: string, data: Partial<Submission>): Promise<Submission | null> {
  const redis = getRedis();
  const submissions = (await redis.get<Submission[]>("submissions")) || [];
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return null;
  
  submissions[index] = { ...submissions[index], ...data };
  await redis.set("submissions", submissions);
  return submissions[index];
}

// 更新作业统计
async function updateAssignmentStats(assignmentId: string): Promise<void> {
  const submissions = await getSubmissions({ assignment_id: assignmentId });
  const gradedSubmissions = submissions.filter((s) => s.status === "graded");
  
  const passedCount = gradedSubmissions.filter((s) => s.is_passed).length;
  const failedCount = gradedSubmissions.length - passedCount;
  
  const scores = gradedSubmissions
    .map((s) => s.auto_score)
    .filter((score): score is number => score !== null);
  
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  
  await updateAssignment(assignmentId, {
    total_submissions: submissions.length,
    passed_count: passedCount,
    failed_count: failedCount,
    average_score: averageScore,
  });
}
