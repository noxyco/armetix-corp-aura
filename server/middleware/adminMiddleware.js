const adminMiddleware = (req, res, next) => {
  //   Assuming your authMiddleware attaches the user to req.user
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé: Réservé aux administrateurs" });
  }
  //   next();
};

module.exports = adminMiddleware;
