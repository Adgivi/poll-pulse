import { FormEventHandler } from "react";
import { Card } from "@/components/ui/Card";
import { InlineAlert } from "@/components/ui/InlineAlert";

type PollBuilderFormProps = {
  question: string;
  options: string[];
  isSubmitting: boolean;
  isFormValid: boolean;
  error: string | null;
  minOptions: number;
  maxOptions: number;
  onQuestionChange: (value: string) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function PollBuilderForm({
  question,
  options,
  isSubmitting,
  isFormValid,
  error,
  minOptions,
  maxOptions,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
}: PollBuilderFormProps) {
  return (
    <Card className="p-8">
      <h1 className="display-font text-3xl font-semibold text-slate-900">Create a poll</h1>
      <p className="mt-2 text-slate-700">
        Create a poll with 2 to 5 options and share the voting link.
      </p>

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="question">
            Question
          </label>
          <input
            id="question"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
            maxLength={180}
            onChange={(event) => onQuestionChange(event.target.value)}
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
              onClick={onAddOption}
              type="button"
            >
              + Add option
            </button>
          </div>

          {options.map((option, index) => (
            <div className="flex gap-2" key={`option-${index}`}>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                maxLength={80}
                onChange={(event) => onOptionChange(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                value={option}
              />
              <button
                aria-label={`Remove option ${index + 1}`}
                className="cursor-pointer rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={options.length <= minOptions}
                onClick={() => onRemoveOption(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

        <button
          className="cursor-pointer w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={!isFormValid || isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create poll"}
        </button>
      </form>
    </Card>
  );
}
