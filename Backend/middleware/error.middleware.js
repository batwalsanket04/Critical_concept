const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const requestedStatus = err.statusCode || err.status;
    const statusCode = Number.isInteger(requestedStatus) &&
        requestedStatus >= 400 &&
        requestedStatus <= 599
        ? requestedStatus
        : 500;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;