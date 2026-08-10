const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function validateRequired(fields, body) {
  const missing = [];
  for (const field of fields) {
    if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
      missing.push(field);
    }
  }
  return missing;
}

export function validateCustomOrder(body) {
  const missing = validateRequired(['name', 'email'], body);
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (!validateEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const hasDescription = body.description && body.description.trim().length > 0;
  const hasFile = body.referenceFile && body.referenceFile.trim().length > 0;

  if (!hasDescription && !hasFile) {
    return { valid: false, error: 'Either description or reference file is required' };
  }

  if (body.description && body.description.length > 5000) {
    return { valid: false, error: 'Description must be under 5000 characters' };
  }

  if (body.name && body.name.length > 100) {
    return { valid: false, error: 'Name must be under 100 characters' };
  }

  if (body.phone && body.phone.length > 20) {
    return { valid: false, error: 'Phone must be under 20 characters' };
  }

  return {
    valid: true,
    data: {
      name: sanitize(body.name),
      email: body.email.trim().toLowerCase(),
      phone: body.phone ? sanitize(body.phone) : null,
      size: body.size ? sanitize(body.size) : null,
      dimensions: body.dimensions ? sanitize(body.dimensions) : null,
      description: body.description ? body.description.trim() : null,
      referenceFile: body.referenceFile ? sanitize(body.referenceFile) : null,
    },
  };
}

export function validateContact(body) {
  const missing = validateRequired(['name', 'email', 'message'], body);
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (!validateEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (body.message.length > 5000) {
    return { valid: false, error: 'Message must be under 5000 characters' };
  }

  if (body.name.length > 100) {
    return { valid: false, error: 'Name must be under 100 characters' };
  }

  if (body.subject && body.subject.length > 200) {
    return { valid: false, error: 'Subject must be under 200 characters' };
  }

  return {
    valid: true,
    data: {
      name: sanitize(body.name),
      email: body.email.trim().toLowerCase(),
      subject: body.subject ? sanitize(body.subject) : null,
      message: body.message.trim(),
    },
  };
}

export function validateTrade(body) {
  const missing = validateRequired(['name', 'email', 'details'], body);
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  if (!validateEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (body.details.length > 5000) {
    return { valid: false, error: 'Details must be under 5000 characters' };
  }

  if (body.name.length > 100) {
    return { valid: false, error: 'Name must be under 100 characters' };
  }

  if (body.company && body.company.length > 200) {
    return { valid: false, error: 'Company must be under 200 characters' };
  }

  return {
    valid: true,
    data: {
      name: sanitize(body.name),
      email: body.email.trim().toLowerCase(),
      company: body.company ? sanitize(body.company) : null,
      projectType: body.projectType ? sanitize(body.projectType) : null,
      details: body.details.trim(),
    },
  };
}

export function validateNewsletter(body) {
  if (!body.email || typeof body.email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!validateEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return {
    valid: true,
    data: {
      email: body.email.trim().toLowerCase(),
    },
  };
}
