import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { InlineAlert } from "@/components/ui/InlineAlert";

type PollBuilderFormProps = {
  pending: boolean;
  errorMessage: string | null;
  minOptions: number;
  maxOptions: number;
  action: (payload: FormData) => void;
};

export function PollBuilderForm({
  pending,
  errorMessage,
  minOptions,
  maxOptions,
  action,
}: PollBuilderFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const isFormValid = useMemo(() => {
    const trimmedQuestion = question.trim();
    const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);
    const uniqueOptions = new Set(cleanedOptions.map((option) => option.toLowerCase()));

    return (
      trimmedQuestion.length > 0 &&
      cleanedOptions.length >= minOptions &&
      cleanedOptions.length <= maxOptions &&
      uniqueOptions.size === cleanedOptions.length
    );
  }, [maxOptions, minOptions, options, question]);

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((item, idx) => (idx === index ? value : item)));
  }

  function addOption() {
    setOptions((current) =>
      current.length >= maxOptions ? current : [...current, ""],
    );
  }

  function removeOption(index: number) {
    setOptions((current) => {
      if (current.length <= minOptions) {
        return current;
      }
      return current.filter((_, idx) => idx !== index);
    });
  }

  return (
    <Card className="p-8">
      <h1 className="display-font text-3xl font-semibold text-slate-900">Create a poll</h1>
      <p className="mt-2 text-slate-700">
        Create a poll with 2 to 5 options and share the voting link.
      </p>

      <form action={action} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="question">
            Question
          </label>
          <input
            id="question"
            name="question"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
            maxLength={180}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we build next?"
            required
            value={question}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Answer options</p>
            <button
              className="cursor-pointer text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={options.length >= maxOptions}
              onClick={addOption}
              type="button"
            >
              + Add option
            </button>
          </div>

          {options.map((option, index) => (
            <div className="flex gap-2" key={`option-${index}`}>
              <input
                name="options"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                maxLength={80}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                value={option}
              />
              <button
                aria-label={`Remove option ${index + 1}`}
                className="cursor-pointer rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={options.length <= minOptions}
                onClick={() => removeOption(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {errorMessage ? <InlineAlert tone="error">{errorMessage}</InlineAlert> : null}

        <button
          className="cursor-pointer w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={!isFormValid || pending}
          type="submit"
        >
          {pending ? "Creating..." : "Create poll"}
        </button>
      </form>
    </Card>
  );
}
