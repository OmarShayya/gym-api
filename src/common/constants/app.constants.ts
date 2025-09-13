export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  },
  RATE_LIMIT: {
    TTL: 60,
    LIMIT: 100,
  },
  CACHE: {
    DEFAULT_TTL: 300,
  },
  REGEX: {
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    NAME: /^[a-zA-Z\s]+$/,
    MEMBER_ID: /^MEM-\d{4}-\d{4}$/,
  },
};
