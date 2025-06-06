const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401).send("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).send(error.message);
    }
  }

  if (!token) {
    res.status(401).send("Not authorized, user not found");
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      res
        .status(403)
        .send(
          "User roles not available. Ensure protect middleware runs first."
        );
    }

    const hasRequiredRole = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (hasRequiredRole) {
      next();
    } else {
      res.status(403).send("User role not authorized");
    }
  };
};

module.exports = { protect, authorize };
