import { extname } from "node:path";

export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function extractTextPlaceholder(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = extname(file.name).toLowerCase();

  if (ext === ".pdf") {
    try {
      // Dynamically import pdf-parse so it only loads in Node context
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const parsed = await pdfParse(buffer);
      return parsed.text.replace(/\s+/g, " ").trim().slice(0, 20_000);
    } catch {
      // Fall through to raw text if parsing fails
    }
  }

  // For .docx or fallback: extract printable ASCII characters only to avoid binary garbage
  const raw = buffer.toString("utf8").replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
  return raw.slice(0, 20_000);
}

export function getFileExtension(fileName: string): string {
  return extname(fileName).toLowerCase();
}
