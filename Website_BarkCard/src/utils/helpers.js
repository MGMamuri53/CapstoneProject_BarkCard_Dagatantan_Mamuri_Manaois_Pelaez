/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

import { CURRENCY, DATE_FORMATS, VALIDATION, ROLES } from '../constants/appConstants';

/**
 * Format amount as currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  return `${CURRENCY.SYMBOL}${numAmount.toLocaleString(CURRENCY.LOCALE, {
    minimumFractionDigits: CURRENCY.MIN_FRACTION_DIGITS,
    maximumFractionDigits: CURRENCY.MAX_FRACTION_DIGITS
  })}`;
};

/**
 * Parse currency string to number
 * @param {string|number} value - The currency value to parse
 * @returns {number} - Parsed numeric value
 */
export const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL_REGEX.test(String(email).trim());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
export const isValidPhone = (phone) => {
  return VALIDATION.PHONE_REGEX.test(String(phone).trim());
};

/**
 * Get user initials from name
 * @param {string} name - Full name
 * @param {number} count - Number of initials to generate (default: 2)
 * @returns {string} - User initials
 */
export const getInitials = (name, count = 2) => {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, count)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

/**
 * Format full name from first and last name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Formatted full name
 */
export const formatFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
};

/**
 * Normalize user role for comparison
 * @param {string} role - User role to normalize
 * @returns {string} - Normalized role
 */
export const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  
  if (normalized === 'superadmin' || normalized === 'superadministrator') {
    return ROLES.SUPER_ADMIN;
  }
  if (normalized === 'owner') {
    return ROLES.OWNER;
  }
  if (normalized === 'staff') {
    return ROLES.STAFF;
  }
  if (normalized === 'student') {
    return ROLES.STUDENT;
  }
  
  return null;
};

/**
 * Check if user is super admin
 * @param {string} role - User role
 * @returns {boolean} - True if super admin
 */
export const isSuperAdmin = (role) => {
  const normalized = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  return normalized === 'superadmin' || normalized === 'superadministrator';
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString(DATE_FORMATS.LOCALE, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format date and time to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString(DATE_FORMATS.LOCALE);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Debounce function execution
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get status badge color class
 * @param {string} status - Status value
 * @returns {string} - CSS class for status badge
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-success text-white';
    case 'Pending':
      return 'bg-warning text-dark';
    case 'Preparing':
    case 'Processing':
      return 'bg-info text-white';
    case 'Ready':
      return 'bg-primary text-white';
    case 'Cancelled':
      return 'bg-danger text-white';
    default:
      return 'bg-secondary text-white';
  }
};

/**
 * Sleep function for async delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};
