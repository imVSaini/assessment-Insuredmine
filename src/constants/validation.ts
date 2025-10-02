/**
 * Validation Rules
 * Standardized validation rules and constraints used throughout the application
 */
export const VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MAX_LENGTH: 50,
  PASSWORD_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]/,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 20,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/, // eslint-disable-line security/detect-unsafe-regex
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  FILE_TYPE_LIMIT: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const
