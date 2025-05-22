export const errorCodes = {
  UNKNOWN_ERROR: 1000,
  AUTHENTICATION_ERROR: 2000,
  USER_MANAGEMENT_ERROR: 3000,

  // Authentication-specific error codes
  USER_NOT_FOUND: 2001,
  ACCOUNT_LOCKED: 2002,
  INCORRECT_CREDENTIALS: 2003,

  // User management-specific error codes
  USER_ALREADY_EXISTS: 3001,
  EMAIL_ALREADY_EXISTS: 3002,
  PHONE_ALREADY_EXISTS: 3003,

  // Hotel Management-specific error codes
  HAS_ACTIVE_BOOKINGS: 4001,

  // Add other specific error codes here
};
