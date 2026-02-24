import { createHash } from "node:crypto";

const INSECURE_DEV_SALT = "poll-pulse-insecure-dev-salt";
const SECURITY_HASH_SALT_ENV = "SECURITY_HASH_SALT";

const IP_HEADERS = ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"] as const;

export type SecurityRequestContext = {
  ip: string | null;
  userAgent: string | null;
  ipHash: string;
  userAgentHash: string;
  identityFallbackHash: string;
  voterId: string | null;
  voterKey: string;
};

function getHashSalt(): string {
  const configured = process.env[SECURITY_HASH_SALT_ENV]?.trim();
  return configured || INSECURE_DEV_SALT;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function secureHash(value: string): string {
  return sha256(`${getHashSalt()}::${value}`);
}

const normalizeHeaderValue = (header: string, value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (header === "x-forwarded-for") {
    return trimmed.split(",")[0]?.trim() || null;
  }
  return trimmed;
};

function readIpFromHeaders(source: Headers): string | null {
  return (
      IP_HEADERS
          .map((header) => normalizeHeaderValue(header, source.get(header) ?? ""))
          .find((ip): ip is string => Boolean(ip)) ?? null
  );
}

function normalizeUserAgent(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createVoterKey(voterId: string | null, identityFallbackHash: string): string {
  if (voterId) {
    return `voter:${secureHash(voterId)}`;
  }

  return `anon:${identityFallbackHash}`;
}

export function buildSecurityRequestContextFromHeaders(
  source: Headers,
  voterId: string | null,
): SecurityRequestContext {
  const ip = readIpFromHeaders(source);
  const userAgent = normalizeUserAgent(source.get("user-agent"));

  const ipHash = secureHash(ip ?? "missing-ip");
  const userAgentHash = secureHash(userAgent ?? "missing-ua");
  const identityFallbackHash = secureHash(`${ip ?? "missing-ip"}|${userAgent ?? "missing-ua"}`);
  const voterKey = createVoterKey(voterId, identityFallbackHash);

  return {
    ip,
    userAgent,
    ipHash,
    userAgentHash,
    identityFallbackHash,
    voterId,
    voterKey,
  };
}

export function buildSecurityRequestContextFromRequest(
  request: Request,
  voterId: string | null,
): SecurityRequestContext {
  return buildSecurityRequestContextFromHeaders(request.headers, voterId);
}

export async function buildSecurityRequestContextFromServerAction(): Promise<SecurityRequestContext> {
  const [{ cookies, headers }, { VOTER_COOKIE_NAME }] = await Promise.all([
    import("next/headers"),
    import("@/lib/voter"),
  ]);
  const cookieStore = await cookies();
  const headerStore = await headers();
  const voterId = cookieStore.get(VOTER_COOKIE_NAME)?.value ?? null;
  return buildSecurityRequestContextFromHeaders(headerStore, voterId);
}

export function getDailyQuotaIdentityKey(context: SecurityRequestContext): string {
  if (context.voterId) {
    return `voter:${secureHash(context.voterId)}`;
  }

  return `anon:${context.identityFallbackHash}`;
}
