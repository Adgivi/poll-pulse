"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { castVote, VoteServiceError } from "@/lib/vote-service";
import { VOTER_COOKIE_NAME } from "@/lib/voter";

export type VoteActionState = {
  errorMessage: string | null;
};

const GENERIC_VOTE_ERROR = "Could not submit vote. Please try again.";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function setVoterCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, voterId: string) {
  cookieStore.set({
    name: VOTER_COOKIE_NAME,
    value: voterId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

function toResultsPath(slug: string): string {
  return `/polls/${slug}/result`;
}

export async function submitVoteAction(
  slug: string,
  _previousState: VoteActionState,
  formData: FormData,
): Promise<VoteActionState> {
  const optionId = String(formData.get("optionId") ?? "");

  const cookieStore = await cookies();
  let voterId = cookieStore.get(VOTER_COOKIE_NAME)?.value ?? null;
  const shouldSetCookie = !voterId;

  if (!voterId) {
    voterId = crypto.randomUUID();
  }

  try {
    await castVote({
      slug,
      optionId,
      voterId,
    });
  } catch (error) {
    if (!(error instanceof VoteServiceError)) {
      return { errorMessage: GENERIC_VOTE_ERROR };
    }

    if (error.code === "ALREADY_VOTED") {
      if (shouldSetCookie) {
        setVoterCookie(cookieStore, voterId);
      }
      redirect(toResultsPath(slug));
    }

    if (error.code === "NOT_FOUND") {
      return { errorMessage: "Poll not found." };
    }

    return { errorMessage: GENERIC_VOTE_ERROR };
  }

  if (shouldSetCookie) {
    setVoterCookie(cookieStore, voterId);
  }

  redirect(toResultsPath(slug));
}
