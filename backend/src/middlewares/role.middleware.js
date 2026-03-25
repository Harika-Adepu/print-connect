
// // authorizeRoles("owner", "admin")
// exports.authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }
//     next();
//   };
// };


// src/middlewares/role.middleware.js

/**
 * Usage: authorizeRoles("owner", "admin")
 * Checks req.user.role (set by auth.middleware) against allowed roles
 * Uses lowercase comparison to prevent casing bugs
 */
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: no user role found" });
    }

    const userRole = req.user.role.toLowerCase();
    const allowed  = allowedRoles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required: [${allowed.join(", ")}]. Your role: ${userRole}`,
      });
    }

    next();
  };
};