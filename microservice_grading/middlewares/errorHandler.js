export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(err.status || err.statusCode || 500).json({
      error: err.error || 'error',
      message: err.message || 'Internal Server Error'
    });
  };