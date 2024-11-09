function sendSuccess(res, data, status = 'ok') {
    return res.json({
      data,
      status,
    });
  }
  
  function sendError(res, error, status = 'error', code = 500) {
    return res.status(code).json({
      error,
      status,
    });
  }
  
  module.exports = { sendSuccess, sendError };