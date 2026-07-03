import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/review-policy";
import { downloadVerificationProof } from "@/lib/supabase-storage";

export const runtime = "nodejs";

type VerificationFileRouteProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(_request: Request, { params }: VerificationFileRouteProps) {
  const session = await auth();

  if (!canAccessAdmin(session?.user?.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { requestId } = await params;
  const verificationRequest = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    select: {
      proofFileName: true,
      proofFilePath: true,
      proofFileType: true,
    },
  });

  if (!verificationRequest?.proofFilePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await downloadVerificationProof(verificationRequest.proofFilePath);
    const fileName = verificationRequest.proofFileName ?? "verification-proof";
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(file, {
      headers: {
        "Content-Disposition": `inline; filename*=UTF-8''${encodedFileName}`,
        "Content-Type": verificationRequest.proofFileType ?? "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
