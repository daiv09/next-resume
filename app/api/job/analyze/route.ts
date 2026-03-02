import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { ok } from "@/lib/api";
import { errorResponse } from "@/lib/errors";
import { extractKeywordsFromJd } from "@/lib/groq/operations";
import { prisma } from "@/lib/prisma";
import { getRedisConnection } from "@/lib/redis/client";
import { jobAnalyzeSchema } from "@/utils/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = jobAnalyzeSchema.parse(body);

    const hash = createHash("sha256").update(parsed.content).digest("hex");
    const cacheKey = `jd:keywords:${hash}`;

    const redis = getRedisConnection();
    const cached = await redis.get(cacheKey);

    const extractedKeywords = cached ? JSON.parse(cached) : await extractKeywordsFromJd(parsed.content);

    if (!cached) {
      await redis.set(cacheKey, JSON.stringify(extractedKeywords), "EX", 3600);
    }

    const jobDescription = await prisma.jobDescription.create({
      data: {
        content: parsed.content,
        extractedKeywords,
      },
      select: {
        id: true,
      },
    });

    return ok({
      jobDescriptionId: jobDescription.id,
      extractedKeywords,
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

