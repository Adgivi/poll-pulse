export const SECURITY_ERROR_CODES = [
  "RATE_LIMITED",
  "DAILY_QUOTA_EXCEEDED",
  "BOT_CHALLENGE_FAILED",
  "SECURITY_DEGRADED",
] as const;

export type SecurityErrorCode = (typeof SECURITY_ERROR_CODES)[number];

export type BlockingSecurityErrorCode = Exclude<SecurityErrorCode, "SECURITY_DEGRADED">;

export const blockingSecurityStatusByCode: Record<BlockingSecurityErrorCode, number> = {
  RATE_LIMITED: 429,
  DAILY_QUOTA_EXCEEDED: 429,
  BOT_CHALLENGE_FAILED: 400,
};

export const defaultSecurityMessageByCode: Record<BlockingSecurityErrorCode, string> = {
  RATE_LIMITED: "Too many write requests. Please try again shortly.",
  DAILY_QUOTA_EXCEEDED: "Daily poll creation quota reached.",
  BOT_CHALLENGE_FAILED: "Bot challenge verification failed.",
};

export type ApiErrorResponse<Code extends string = string> = {
  error: {
    code: Code;
    message: string;
  };
};

export type SecurityBlock = {
  code: BlockingSecurityErrorCode;
  message: string;
  status: number;
  retryAfterSeconds?: number;
};

export function createSecurityBlock(
  code: BlockingSecurityErrorCode,
  overrides?: Partial<Omit<SecurityBlock, "code">>,
): SecurityBlock {
  return {
    code,
    message: overrides?.message ?? defaultSecurityMessageByCode[code],
    status: overrides?.status ?? blockingSecurityStatusByCode[code],
    retryAfterSeconds: overrides?.retryAfterSeconds,
  };
}

export function toApiErrorResponse<Code extends string>(
  code: Code,
  message: string,
): ApiErrorResponse<Code> {
  return {
    error: {
      code,
      message,
    },
  };
}

export function toCreateSecurityErrorMessage(code: BlockingSecurityErrorCode): string {
  if (code === "RATE_LIMITED") {
    return "Too many attempts. Please wait a few minutes before creating another poll.";
  }

  if (code === "DAILY_QUOTA_EXCEEDED") {
    return "You reached today's creation quota. Please try again tomorrow.";
  }

  return "Security check failed. Please retry.";
}

export function toVoteSecurityErrorMessage(code: BlockingSecurityErrorCode): string {
  if (code === "RATE_LIMITED") {
    return "Too many vote attempts from this connection. Please wait and retry.";
  }

  return "Security check failed. Please retry.";
}
