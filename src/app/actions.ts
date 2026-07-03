"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReviewStatus, VerificationStatus } from "@prisma/client";
import { z } from "zod";

import { auth, signIn, signOut } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { canAccessAdmin, normalizeRating } from "@/lib/review-policy";
import { uploadVerificationProof } from "@/lib/supabase-storage";

const reviewSchema = z.object({
  title: z.string().min(4).max(100),
  content: z.string().min(20).max(2500),
});

const verificationSchema = z.object({
  identity: z.enum(["VERIFIED_PARENT", "VERIFIED_TEACHER", "REGISTERED_EDUCATOR", "STUDENT", "ALUMNI", "EDUCATION_PROFESSIONAL"]),
  statement: z.string().min(20).max(1200),
});

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  await signIn("nodemailer", { email, redirectTo: "/" });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

export async function submitReview(institutionSlug: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isDatabaseConfigured) {
    redirect(`/institutions/${institutionSlug}/review?status=database-required`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { verifiedIdentity: true },
  });

  if (!user?.verifiedIdentity) {
    redirect(`/verify?status=identity-required`);
  }

  const rating = normalizeRating(formData.get("rating"));
  const teachingQuality = normalizeRating(formData.get("teachingQuality"));
  const curriculum = normalizeRating(formData.get("curriculum"));
  const teacherProfessionalism = normalizeRating(formData.get("teacherProfessionalism"));
  const learningEnvironment = normalizeRating(formData.get("learningEnvironment"));
  const communication = normalizeRating(formData.get("communication"));
  const valueForMoney = normalizeRating(formData.get("valueForMoney"));
  const studentEngagement = normalizeRating(formData.get("studentEngagement"));
  const parsed = reviewSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success || !rating || !teachingQuality || !curriculum || !teacherProfessionalism || !learningEnvironment || !communication || !valueForMoney || !studentEngagement) {
    redirect(`/institutions/${institutionSlug}/review?status=invalid`);
  }

  const institution = await prisma.institution.findUnique({ where: { slug: institutionSlug } });

  if (!institution) {
    redirect("/institutions");
  }

  await prisma.review.create({
    data: {
      institutionId: institution.id,
      userId: session.user.id,
      rating,
      title: parsed.data.title,
      content: parsed.data.content,
      identity: user.verifiedIdentity,
      identityVerified: true,
      status: "PENDING",
      ratingBreakdown: {
        create: {
          teachingQuality,
          curriculum,
          teacherProfessionalism,
          learningEnvironment,
          communication,
          valueForMoney,
          studentEngagement,
        },
      },
    },
  });

  revalidatePath(`/institutions/${institutionSlug}`);
  redirect(`/institutions/${institutionSlug}?status=review-submitted`);
}

export async function submitVerificationRequest(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isDatabaseConfigured) {
    redirect("/verify?status=database-required");
  }

  const parsed = verificationSchema.safeParse({
    identity: formData.get("identity"),
    statement: formData.get("statement"),
  });

  if (!parsed.success) {
    redirect("/verify?status=invalid");
  }

  const proof = formData.get("proof");
  let proofFilePath: string | undefined;
  let proofFileName: string | undefined;
  let proofFileType: string | undefined;

  if (proof instanceof File && proof.size > 0) {
    const uploadedProof = await uploadVerificationProof(session.user.id, proof);

    proofFilePath = uploadedProof.filePath;
    proofFileName = uploadedProof.fileName;
    proofFileType = uploadedProof.fileType;
  }

  await prisma.verificationRequest.create({
    data: {
      userId: session.user.id,
      requestedIdentity: parsed.data.identity,
      statement: parsed.data.statement,
      proofFilePath,
      proofFileName,
      proofFileType,
    },
  });

  redirect("/verify?status=submitted");
}

export async function moderateReview(formData: FormData) {
  const session = await auth();

  if (!canAccessAdmin(session?.user?.role)) {
    redirect("/login");
  }

  if (!isDatabaseConfigured) {
    redirect("/admin?status=database-required");
  }

  const reviewId = String(formData.get("reviewId"));
  const status = String(formData.get("status")) as ReviewStatus;
  const note = String(formData.get("note") ?? "");

  await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await prisma.reviewModerationAction.create({
    data: {
      reviewId,
      moderatorId: session!.user.id,
      status,
      note,
    },
  });

  revalidatePath("/admin");
}

export async function moderateVerification(formData: FormData) {
  const session = await auth();

  if (!canAccessAdmin(session?.user?.role)) {
    redirect("/login");
  }

  if (!isDatabaseConfigured) {
    redirect("/admin?status=database-required");
  }

  const requestId = String(formData.get("requestId"));
  const status = String(formData.get("status")) as VerificationStatus;
  const note = String(formData.get("note") ?? "");

  const request = await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status,
      reviewNote: note,
      reviewedAt: new Date(),
      reviewedById: session!.user.id,
    },
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        verifiedIdentity: request.requestedIdentity,
        identityVerifiedAt: new Date(),
      },
    });
  }

  revalidatePath("/admin");
}
