const ROLES = ['STUDENT', 'INSTRUCTOR', 'INSTITUTION_ADMIN'];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateUser = (req, res, next) => {
  const { full_name, email, password_salt, password_hash, role } = req.body;
  const errors = [];

  // Validate required fields
  if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
    errors.push('Full name is required and must be a non-empty string');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password_salt || typeof password_salt !== 'string' || password_salt.length === 0) {
    errors.push('Password salt is required');
  }

  if (!password_hash || typeof password_hash !== 'string' || password_hash.length === 0) {
    errors.push('Password hash is required');
  }

  // Validate role if provided
  if (role && !ROLES.includes(role)) {
    errors.push(`Role must be one of: ${ROLES.join(', ')}`);
  }

  // Validate field lengths
  if (full_name && full_name.length > 255) {
    errors.push('Full name must be less than 255 characters');
  }

  if (email && email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { full_name, email, password_salt, password_hash, role } = req.body;
  const errors = [];

  // Check if at least one field is provided
  if (!full_name && !email && !password_salt && !password_hash && !role) {
    return res.status(400).json({
      success: false,
      message: 'At least one field must be provided for update'
    });
  }

  // Validate provided fields
  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || full_name.trim().length === 0) {
      errors.push('Full name must be a non-empty string');
    } else if (full_name.length > 255) {
      errors.push('Full name must be less than 255 characters');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      errors.push('Valid email is required');
    } else if (email.length > 255) {
      errors.push('Email must be less than 255 characters');
    }
  }

  if (password_salt !== undefined) {
    if (typeof password_salt !== 'string' || password_salt.length === 0) {
      errors.push('Password salt must be a non-empty string');
    }
  }

  if (password_hash !== undefined) {
    if (typeof password_hash !== 'string' || password_hash.length === 0) {
      errors.push('Password hash must be a non-empty string');
    }
  }

  if (role !== undefined && !ROLES.includes(role)) {
    errors.push(`Role must be one of: ${ROLES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateUserId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  req.params.id = parseInt(id);
  next();
};