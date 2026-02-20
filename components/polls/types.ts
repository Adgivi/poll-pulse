export type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export type AppMetrics = {
  totalPolls: number;
  totalVotes: number;
  pollsLast24h: number;
  votesLast24h: number;
};

export type CreatePollResponse = {
  id: string;
  slug: string;
  voteUrl: string;
  resultsUrl: string;
};

export type PollDetail = {
  id: string;
  slug: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  hasVoted: boolean;
};

export type PollResults = {
  pollId: string;
  slug: string;
  question: string;
  totalVotes: number;
  options: Array<{ id: string; text: string; votes: number; percentage: number }>;
};

export type CopiedLinkKind = "vote" | "results";

export type PollListItem = {
  id: string;
  slug: string;
  question: string;
  createdAt: Date;
  _count: {
    votes: number;
    options: number;
  };
};
