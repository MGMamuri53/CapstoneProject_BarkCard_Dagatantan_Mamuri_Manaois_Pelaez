/**
 * Application Constants
 * Centralized configuration for the BarkCard application
 */

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  OWNER: 'Owner',
  STAFF: 'Staff',
  STUDENT: 'Student'
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Payment Types
export const PAYMENT_TYPE = {
  NFC: 'NFC',
  CASH: 'Cash',
  BARKCARD_BALANCE: 'BarkCard Balance'
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_USER: 'barkcard-auth-user'
};

// API Configuration
export const API_CONFIG = {
  SUPABASE_TABLE_NAMES: {
    USERS: 'tbl_user',
    ORDERS: 'tbl_order',
    ORDER_DETAILS: 'tbl_orderdetails',
    STORE_PRODUCTS: 'tbl_storeproducts',
    USER_BALANCE: 'tbl_userbalance'
  }
};

// Menu Categories
export const MENU_CATEGORIES = ['All Categories', 'Main Course', 'Beverages', 'Sides', 'Desserts'];

// Pagination
export const PAGINATION = {
  ORDERS_PER_PAGE: 8,
  USERS_PER_PAGE: 10,
  ITEMS_PER_PAGE: 12
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9+\-\s()]+$/,
  ID_PATTERN: /^[A-Z]{0,3}-\d{4}-\d{9}$/
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 60,
  MODAL_Z_INDEX: 1050,
  DROPDOWN_Z_INDEX: 1000
};

// Date/Time Formats
export const DATE_FORMATS = {
  LOCALE: 'en-PH',
  DISPLAY_FORMAT: 'short',
  TIME_FORMAT: 'short'
};

// Currency Configuration
export const CURRENCY = {
  SYMBOL: '₱',
  LOCALE: 'en-PH',
  MIN_FRACTION_DIGITS: 2,
  MAX_FRACTION_DIGITS: 2
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You do not have permission to access this page.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  FAILED_TO_FETCH: 'Failed to fetch data. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  EMAIL_REQUIRED: 'Email address is required.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  UPDATED: 'Updated successfully.',
  CREATED: 'Created successfully.',
  DELETED: 'Deleted successfully.',
  LOGGED_OUT: 'Logged out successfully.',
  SAVED: 'Changes saved successfully.'
};
