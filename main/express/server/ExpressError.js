class ExpressError extends Error {
  constructor(message, statusCode) {
    super(message); // This is important!
    this.name = "ExpressError"; // Optional: sets the name in the stack trace
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;