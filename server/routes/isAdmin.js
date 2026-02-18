const isAdmin = (req, res, next) => {
  // .trim() removes hidden spaces, .toLowerCase() handles "Admin" vs "admin"
  // const role = req.user?.role?.trim().toLowerCase();

  // if (req.user && role === "admin") {
  //   next();
  // } else {
  //   console.log(`Access Denied for role: [${req.user?.role}]`);
  //   res
  //     .status(403)
  //     .json({ message: "Accès refusé: Réservé à l'administrateur" });
  // }
  next();
};
exports.isAdmin = isAdmin;
