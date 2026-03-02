-- Optional JSONB GIN index for skill search in PostgreSQL
CREATE INDEX IF NOT EXISTS resume_parsed_json_gin_idx
ON "Resume"
USING GIN (("parsedJson"));
