"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            margin: "0 0 1rem",
          }}
        >
          ERROR
        </h1>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#666",
            marginBottom: "3rem",
          }}
        >
          {error?.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 2.5rem",
            background: "#fff",
            color: "#000",
            border: "none",
            fontFamily: "monospace",
            fontSize: "0.7rem",
            fontWeight: 900,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
