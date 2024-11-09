const { sendSuccess, sendError } = require('../utils/response');

function ensureAuthenticated(req, res, next) {
  console.log('Session:', req.session);
  console.log('User:', req.user);

    if (req.isAuthenticated()) {
      return next();
    }
    sendError(res, "Необходимо аутентифицироваться", "error", 401);
  }
  
  module.exports = ensureAuthenticated;
  