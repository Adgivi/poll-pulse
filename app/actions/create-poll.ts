"use server";

import { createPollFromInput } from "@/lib/poll-service";
import { CreatePollResponse } from "@/components/polls/types";

export type CreatePollActionState = {
  createdPoll: CreatePollResponse | null;
  errorMessage: string | null;
};

export async function createPollAction(
  _previousState: CreatePollActionState,
  formData: FormData,
): Promise<CreatePollActionState> {
  const question = String(formData.get("question") ?? "");
  const options = formData
    .getAll("options")
    .map((value) => String(value ?? ""));

  try {
    const poll = await createPollFromInput({
      question,
      options,
    });

    return {
      createdPoll: poll,
      errorMessage: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while creating the poll.";

    return {
      createdPoll: null,
      errorMessage: message,
    };
  }
}
