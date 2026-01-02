export const SYSTEM_USER = {
  ID: '00000000-0000-0000-0000-000000000000',
  NAME: 'HỆ THỐNG',
};

export const CACHE_TTL = {
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
};

export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRES: '1h',
  REFRESH_TOKEN_EXPIRES: '7d',
} as const;

export const TIME_MS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
};
