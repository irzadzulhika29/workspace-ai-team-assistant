/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
}

/**
 * Middleware to check if user is authenticated (optional)
 * Continues even if not authenticated
 */
export function optionalAuth(req, res, next) {
  // Just continue, req.user will be undefined if not authenticated
  next();
}
