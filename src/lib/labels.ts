import type { InstitutionType, ReviewerIdentity, ReviewStatus, UserRole, VerificationStatus } from "@prisma/client";

export const identityLabels: Record<ReviewerIdentity, string> = {
  VERIFIED_PARENT: "已驗證家長",
  VERIFIED_TEACHER: "已驗證教師",
  REGISTERED_EDUCATOR: "註冊教育工作者",
  STUDENT: "學生",
  ALUMNI: "校友",
  EDUCATION_PROFESSIONAL: "教育專業人士",
};

export const institutionTypeLabels: Record<InstitutionType, string> = {
  SCHOOL: "學校",
  EDUCATION_CENTRE: "教育中心",
};

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  PENDING: "待審核",
  PUBLISHED: "已發布",
  HIDDEN: "已隱藏",
  REJECTED: "已拒絕",
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  PENDING: "待審核",
  APPROVED: "已核准",
  REJECTED: "已拒絕",
};

export const roleLabels: Record<UserRole, string> = {
  USER: "用戶",
  ADMIN: "管理員",
};

export const ratingCategoryLabels = {
  teachingQuality: "教學質素",
  curriculum: "課程內容",
  teacherProfessionalism: "教師專業度",
  learningEnvironment: "學習環境",
  communication: "溝通",
  valueForMoney: "性價比",
  studentEngagement: "學生投入度",
} as const;

export const categoryNames = [
  "STEM",
  "英文",
  "中文",
  "數學",
  "編程",
  "機械人",
  "Playgroup",
  "面試準備",
  "IB",
  "DSE",
] as const;
