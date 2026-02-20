export const VOTER_COOKIE_NAME = "pp_voter_id";

export function getVoterIdFromRequest(request: Request): string | null {
  const rawCookies = request.headers.get("cookie");
  if (!rawCookies) {
    return null;
  }

  const cookies = rawCookies.split(";").map((part) => part.trim());
  const entry = cookies.find((cookie) => cookie.startsWith(`${VOTER_COOKIE_NAME}=`));
  if (!entry) {
    return null;
  }

  const value = entry.slice(VOTER_COOKIE_NAME.length + 1).trim();
  return value || null;
}
