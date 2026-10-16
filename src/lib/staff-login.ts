// Temporary staff login until SMS OTP is set up: admins and owners sign in
// with a phone number + PIN. Under the hood this is Supabase email/password
// auth on a synthetic address, so no SMS provider is needed.
//
// To add a staff member: Supabase → Authentication → Users → Add user →
// email `<10-digit number>@staff.rameshrentals.local`, password = their PIN,
// tick "Auto Confirm User". Then set rameshrentals.profiles.is_admin or owner_id for that user.
export const STAFF_EMAIL_DOMAIN = "staff.rameshrentals.local";

export function staffLoginEmail(phone: string) {
  return `${phone}@${STAFF_EMAIL_DOMAIN}`;
}
