export const ADMIN_DEV_EMAILS = [
  "mdit2416@gmail.com",
  "nobuo.2.17.93@gmail.com",
  "var-s.no.1@comet.ocn.ne.jp",
];

export function canAccessAdmin(
  role: string | null | undefined,
  email: string | null | undefined
): boolean {
  return role === "admin" || ADMIN_DEV_EMAILS.includes(email || "");
}
