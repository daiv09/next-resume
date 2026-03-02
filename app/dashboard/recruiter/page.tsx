import { prisma } from "@/lib/prisma";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function RecruiterPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; minScore?: string }>;
}) {
  const params = await searchParams;
  const skill = (params.skill ?? "").toLowerCase().trim();
  const minScore = params.minScore ? Number(params.minScore) : undefined;

  const resumes = await prisma.resume.findMany({
    where: { parseStatus: "COMPLETED" },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const filtered = resumes.filter((resume) => {
    const parsed = (resume.parsedJson ?? {}) as Record<string, unknown>;
    const skills = toStringArray(parsed.skills).map((item) => item.toLowerCase());
    const score = resume.analyses[0]?.score ?? null;

    const skillMatch = !skill || skills.some((item) => item.includes(skill));
    const scoreMatch = minScore === undefined || (typeof score === "number" && score >= minScore);
    return skillMatch && scoreMatch;
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Recruiter Search</h1>
      <form className="flex flex-wrap gap-3">
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          name="skill"
          defaultValue={params.skill ?? ""}
          placeholder="Search skill"
        />
        <input
          className="rounded-md border border-zinc-300 px-3 py-2"
          name="minScore"
          type="number"
          min={0}
          max={100}
          defaultValue={params.minScore ?? ""}
          placeholder="Min score"
        />
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
          Search
        </button>
      </form>
      <div className="grid gap-3">
        {filtered.map((resume) => {
          const parsed = (resume.parsedJson ?? {}) as Record<string, unknown>;
          return (
            <article key={resume.id} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{resume.fileName}</h2>
                <p className="text-xs text-zinc-500">Public Resume</p>
              </div>
              <p className="mt-2 text-sm">Score: {resume.analyses[0]?.score ?? "-"}</p>
              <p className="mt-2 text-sm">Skills: {toStringArray(parsed.skills).join(", ") || "-"}</p>
              <p className="mt-2 text-sm">Experience: {toStringArray(parsed.experience).join(" | ") || "-"}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}

