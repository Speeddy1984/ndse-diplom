function ensureAuthenticated(req, res, next) {
  console.log('Session:', req.session);
  console.log('User:', req.user);

    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Необходима авторизация", status: "error" });
  }
  
  module.exports = ensureAuthenticated;
  