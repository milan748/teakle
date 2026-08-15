const { log } = require('./logger');

const REQUIRED_ENV = {
  SESSION_SECRET: { required: true, minLength: 32 },
  ADMIN_EMAIL: { required: true },
  ADMIN_PASSWORD: { required: true, minLength: 8 },
};

const OPTIONAL_ENV = {
  DATABASE_PATH: { default: './data/teakle.db' },
  MEDIA_UPLOAD_DIR: { default: './public/uploads/media' },
  ALLOW_INSECURE_SESSION: { default: 'false', values: ['true', 'false'] },
  NEXT_PUBLIC_SITE_URL: { default: 'http://localhost:3000' },
  NODE_ENV: { default: 'development', values: ['development', 'production', 'test'] },
  PORT: { default: '3000' },
  BACKUP_DIR: { default: './backups' },
  ADMIN_SESSION_SECRET: { default: '' },
  CUSTOMER_SESSION_SECRET: { default: '' },
  EMAIL_PROVIDER: { default: 'none', values: ['none', 'resend', 'sendgrid'] },
  EMAIL_FROM: { default: '' },
  EMAIL_API_KEY: { default: '' },
  PAYMENT_PROVIDER: { default: 'none', values: ['none', 'razorpay', 'stripe'] },
  PAYMENT_KEY_ID: { default: '' },
  PAYMENT_KEY_SECRET: { default: '' },
  PAYMENT_WEBHOOK_SECRET: { default: '' },
};

function validateEnv({ strict = true, logResults = true } = {}) {
  const errors = [];
  const warnings = [];
  const validated = {};

  for (const [key, config] of Object.entries(REQUIRED_ENV)) {
    const value = process.env[key];

    if (!value) {
      if (strict) {
        errors.push(`Missing required: ${key}`);
      } else {
        warnings.push(`Missing required (non-strict): ${key}`);
      }
      continue;
    }

    if (config.minLength && value.length < config.minLength) {
      errors.push(`${key} must be at least ${config.minLength} characters`);
      continue;
    }

    validated[key] = value;
  }

  for (const [key, config] of Object.entries(OPTIONAL_ENV)) {
    const value = process.env[key];

    if (!value) {
      validated[key] = config.default;
      continue;
    }

    if (config.values && !config.values.includes(value)) {
      warnings.push(`${key}="${value}" not in allowed values [${config.values.join(', ')}], using default: ${config.default}`);
      validated[key] = config.default;
      continue;
    }

    validated[key] = value;
  }

  if (logResults && warnings.length > 0) {
    for (const w of warnings) {
      log.warn(w);
    }
  }

  if (errors.length > 0) {
    if (logResults) {
      for (const e of errors) {
        log.error(e);
      }
    }
    return { valid: false, errors, warnings, env: validated };
  }

  return { valid: true, errors: [], warnings, env: validated };
}

function getEnv() {
  const result = validateEnv({ strict: false, logResults: false });
  return result.env;
}

function requireEnv() {
  const result = validateEnv({ strict: true, logResults: true });
  if (!result.valid) {
    throw new Error(`Environment validation failed: ${result.errors.join('; ')}`);
  }
  return result.env;
}

module.exports = { validateEnv, getEnv, requireEnv, REQUIRED_ENV, OPTIONAL_ENV };
