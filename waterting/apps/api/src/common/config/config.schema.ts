import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  REDIS_URL: Joi.string().required(),
  GROQ_API_KEY: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().optional(),
  MXB_API_KEY: Joi.string().optional(),
  R2_ACCOUNT_ID: Joi.string().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_PUBLIC_URL: Joi.string().uri().required(),
  BREVO_API_KEY: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  MSG91_AUTH_KEY: Joi.string().required(),
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  TWILIO_FROM_NUMBER: Joi.string().required(),
  SENTRY_DSN: Joi.string().uri().optional(),
  FB_APP_ID: Joi.string().optional(),
  FB_VERIFY_TOKEN: Joi.string().optional(),
});
