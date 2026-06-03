const checkClerkUser = (req, res, next) => {
  const clerkUserId = req.headers['x-clerk-user-id'];
  
  if (!clerkUserId) {
    return res.status(401).json({ error: "Unauthorized. Clerk User ID missing in headers" });
  }
  
  req.clerkUserId = clerkUserId;
  next();
};

module.exports = checkClerkUser;

// middleware/adminAuth.js
const adminAuth = (req, res, next) => {
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID
  const userId = req.headers['x-clerk-user-id']
  if (!userId || userId !== ADMIN_USER_ID) {
    return res.status(403).json({ error: 'Admin access only' })
  }
  next()
}
module.exports = adminAuth