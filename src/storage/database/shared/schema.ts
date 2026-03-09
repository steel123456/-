import { pgTable, serial, timestamp, varchar, text, integer, boolean, jsonb, index, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统健康检查表（保留）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户信息表
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("student"), // teacher 或 student
    className: varchar("class_name", { length: 100 }),
    avatar: text("avatar"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("profiles_email_idx").on(table.email),
    index("profiles_role_idx").on(table.role),
  ]
);

// 作业表
export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    teacherId: uuid("teacher_id").notNull(),
    teacherName: varchar("teacher_name", { length: 128 }),
    status: varchar("status", { length: 20 }).notNull().default("active"), // active 或 closed
    totalSubmissions: integer("total_submissions").default(0),
    passedCount: integer("passed_count").default(0),
    failedCount: integer("failed_count").default(0),
    averageScore: integer("average_score"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("assignments_teacher_id_idx").on(table.teacherId),
    index("assignments_status_idx").on(table.status),
    index("assignments_deadline_idx").on(table.deadline),
  ]
);

// 作业提交记录表
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    assignmentId: uuid("assignment_id").notNull(),
    studentId: uuid("student_id").notNull(),
    studentName: varchar("student_name", { length: 128 }),
    contentType: varchar("content_type", { length: 20 }).notNull(), // text 或 image
    content: text("content"), // 文字内容
    fileKey: text("file_key"), // 图片文件key
    autoScore: integer("auto_score"), // 自动评分 (0-100)
    feedback: text("feedback"), // AI批改反馈
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending 或 graded
    isPassed: boolean("is_passed").default(false),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    gradedAt: timestamp("graded_at", { withTimezone: true }),
  },
  (table) => [
    index("submissions_assignment_id_idx").on(table.assignmentId),
    index("submissions_student_id_idx").on(table.studentId),
    index("submissions_status_idx").on(table.status),
  ]
);

// 类型导出
export type Profile = typeof profiles.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
