export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // If it's a validation error from class-validator
  if (Array.isArray(err) && err[0]?.constraints) {
    statusCode = 400;
    message = err
      .map((e) => Object.values(e.constraints))
      .flat()
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
