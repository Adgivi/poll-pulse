const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

type CreatePollInput = {
  question?: unknown;
  options?: unknown;
};

export type CreatePollData = {
  question: string;
  options: string[];
};

export function parseCreatePollInput(input: CreatePollInput): CreatePollData {
  const question =
    typeof input.question === "string" ? input.question.trim() : "";

  if (!question) {
    throw new Error("Question is required.");
  }

  if (question.length > 180) {
    throw new Error("Question is too long (max 180 characters).");
  }

  if (!Array.isArray(input.options)) {
    throw new Error("Options must be an array.");
  }

  const options = input.options
    .map((option) => (typeof option === "string" ? option.trim() : ""))
    .filter(Boolean);

  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    throw new Error("Options must contain between 2 and 5 items.");
  }

  const duplicates = new Set<string>();
  for (const option of options) {
    if (option.length > 80) {
      throw new Error("Each option must be at most 80 characters.");
    }

    const key = option.toLowerCase();
    if (duplicates.has(key)) {
      throw new Error("Options must be unique.");
    }
    duplicates.add(key);
  }

  return { question, options };
}

export function createPollSlug(question: string): string {
  const base = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base || "poll"}-${suffix}`;
}
