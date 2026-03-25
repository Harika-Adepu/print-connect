// // src/services/auth.service.js
// import api from "./api";
// import * as SecureStore from "expo-secure-store";

// /**
//  * POST /api/auth/register
//  * Body: { name, email, password, role }
//  */
// export const registerUser = async ({ name, email, password, role = "customer" }) => {
//   const response = await api.post("/auth/register", { name, email, password, role });
//   return response.data; // { message, user }
// };

// /**
//  * POST /api/auth/login
//  * Body: { email, password }
//  * Stores JWT in SecureStore on success
//  */
// export const loginUser = async ({ email, password }) => {
//   const response = await api.post("/auth/login", { email, password });
//   const { token, user } = response.data;

//   await SecureStore.setItemAsync("token", token);

//   return { token, user }; // { id, name, email, role }
// };

// /**
//  * GET /api/auth/me
//  * Returns the logged-in user object
//  */
// export const getMe = async () => {
//   const response = await api.get("/auth/me");
//   return response.data; // User object (no password)
// };

// /**
//  * Clears JWT from SecureStore (logout)
//  */
// export const logoutUser = async () => {
//   await SecureStore.deleteItemAsync("token");
// };

// /**
//  * Check if a token exists in SecureStore
//  */
// export const getStoredToken = async () => {
//   return await SecureStore.getItemAsync("token");
// };

//********************************************************* 


// src/services/auth.service.js
import api from "./api";
import * as SecureStore from "expo-secure-store";

export const registerUser = async (userData) => {
  // Use destructuring to ensure we don't accidentally send undefined roles
  const { name, email, password, role } = userData;
  const response = await api.post("/auth/register", { name, email, password, role });
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  const { token, user } = response.data;

  if (token) {
    await SecureStore.setItemAsync("token", token);
  }

  return { token, user }; 
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  await SecureStore.deleteItemAsync("token");
};

export const getStoredToken = async () => {
  return await SecureStore.getItemAsync("token");
};