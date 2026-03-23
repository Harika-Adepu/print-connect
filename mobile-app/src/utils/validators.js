// src/utils/validators.js

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

export const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!email || !validateEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors; // empty object = valid
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateOrderForm = ({ product, quantity }) => {
  const errors = {};

  if (!product) errors.product = "Please select a product";
  if (!quantity || quantity < 1) errors.quantity = "Quantity must be at least 1";

  return errors;
};