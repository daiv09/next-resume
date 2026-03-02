import { NextRequest, NextResponse } from "next/server";

import { ok } from "@/lib/api";
import { errorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { enqueueResumeParse } from "@/lib/redis/queues";
import { extractTextPlaceholder, fileToBase64, getFileExtension } from "@/utils/file";
import { validateResumeFile } from "@/utils/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "file is required" } }, { status: 400 });
    }

    validateResumeFile(file);

    const fileName = file.name;
    const extension = getFileExtension(fileName);
    if (![".pdf", ".docx"].includes(extension)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "File extension must be .pdf or .docx" } },
        { status: 400 },
      );
    }

    const [base64, extractedText] = await Promise.all([fileToBase64(file), extractTextPlaceholder(file)]);

    const fileData = JSON.stringify({
      base64,
      extractedText,
      mimeType: file.type,
      fileName,
    });

    const resume = await prisma.resume.create({
      data: {
        fileName,
        fileData,
      },
      select: { id: true, parseStatus: true },
    });

    await enqueueResumeParse({ resumeId: resume.id });

    return ok({ resumeId: resume.id, status: resume.parseStatus }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

