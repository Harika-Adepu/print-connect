// src/store/index.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getMe, getStoredToken, logoutUser } from "../services/auth.service";

// ─── State shape ─────────────────────────────────────────────────────────────
const initialState = {
  user: null,          // { id, name, email, role }
  token: null,
  isLoading: true,     // true while checking stored token on boot
  isAuthenticated: false,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On app boot: check if a valid token is stored
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          const user = await getMe();
          dispatch({ type: "SET_USER", payload: { user, token } });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (_) {
        // Token expired or invalid → clear it
        await logoutUser();
        dispatch({ type: "LOGOUT" });
      }
    };

    bootstrapAuth();
  }, []);

  const login = (user, token) => {
    dispatch({ type: "SET_USER", payload: { user, token } });
  };

  const logout = async () => {
    await logoutUser();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};