import { NextRequest, NextResponse } from "next/server";

import { ok } from "@/lib/api";
import { AppError, errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { enqueueAnalysis } from "@/lib/redis/queues";
import { analysisRunSchema } from "@/utils/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = analysisRunSchema.parse(body);

    const analysis = await prisma.$transaction(async (tx) => {
      const [resume, jobDescription] = await Promise.all([
        tx.resume.findFirst({ where: { id: parsed.resumeId } }),
        tx.jobDescription.findFirst({ where: { id: parsed.jobDescriptionId } }),
      ]);

      if (!resume || !jobDescription) {
        throw new AppError(404, "NOT_FOUND", "Resume or job description not found");
      }

      return tx.analysis.create({
        data: {
          resumeId: resume.id,
          jobDescriptionId: jobDescription.id,
          status: "PENDING",
        },
        select: { id: true, status: true },
      });
    });

    await enqueueAnalysis({ analysisId: analysis.id });

    return ok({ analysisId: analysis.id, status: analysis.status }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

