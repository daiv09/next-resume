import { NextRequest, NextResponse } from "next/server";

import { ok } from "@/lib/api";
import { errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const skill = (searchParams.get("skill") ?? "").trim().toLowerCase();
    const minScoreRaw = searchParams.get("minScore");
    const minScore = minScoreRaw ? Number(minScoreRaw) : undefined;

    const resumes = await prisma.resume.findMany({
      where: {
        parseStatus: "COMPLETED",
      },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            score: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const filtered = resumes.filter((resume) => {
      const parsed = (resume.parsedJson ?? {}) as Record<string, unknown>;
      const skills = toStringArray(parsed.skills).map((item) => item.toLowerCase());
      const latestScore = resume.analyses[0]?.score ?? null;

      const skillMatch = !skill || skills.some((item) => item.includes(skill));
      const scoreMatch = minScore === undefined || (typeof latestScore === "number" && latestScore >= minScore);
      return skillMatch && scoreMatch;
    });

    return ok({
      items: filtered.map((resume) => ({
        id: resume.id,
        fileName: resume.fileName,
        userEmail: "Public Resume",
        parsedJson: resume.parsedJson,
        latestAnalysis: resume.analyses[0] ?? null,
        createdAt: resume.createdAt,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

