import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_NAME: Joi.string().default('Bcool Construction API'),
  APP_PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  APP_URL: Joi.string().uri().optional(),

  // Database
  DB_TYPE: Joi.string().valid('postgres', 'mysql').default('postgres'),
  DB_HOST: Joi.string().required().messages({
    'any.required': 'DB_HOST is required',
  }),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required().messages({
    'any.required': 'DB_USERNAME is required',
  }),
  DB_PASSWORD: Joi.string().required().messages({
    'any.required': 'DB_PASSWORD is required',
  }),
  DB_DATABASE: Joi.string().required().messages({
    'any.required': 'DB_DATABASE is required',
  }),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // JWT & Security
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters for security',
    'any.required': 'JWT_SECRET is required',
  }),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Throttler (Rate Limiting)
  THROTTLER_TTL: Joi.number().default(60),
  THROTTLER_LIMIT: Joi.number().default(10),

  // CORS
  CORS_ORIGIN: Joi.string().optional(),

  // AWS S3 (optional for development)
  AWS_ACCESS_KEY_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_REGION: Joi.string().default('ap-southeast-1'),
  AWS_S3_BUCKET: Joi.string().optional(),
  AWS_S3_PUBLIC_URL: Joi.string().uri().optional(),

  // Mail
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASSWORD: Joi.string().optional(),
  MAIL_FROM: Joi.string().email().optional(),
  CONTACT_NOTIFICATION_EMAIL: Joi.string()
    .email()
    .default('dangvanhaufpt2019@gmail.com'),
});
