// strong password(Uppercase letter, lowercase letters, a digit) regular expression
export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
// phone number regular expression (country code prefixed with plus sign)
export const phoneNumberRegex = /^07\d{8}$/;
