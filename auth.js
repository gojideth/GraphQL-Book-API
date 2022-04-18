const { ApolloError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer")[1];
    if (token) {
      try {
        const user = jwt.verify(token, "UNSAFE_STRING");
        return user;
      } catch (error) {
        throw new ApolloError("Invalided / Expired token");
      }
      throw new Error("Authentication token must be Bearer");
    }
  }
  throw new Error("Authentication header must be provided");
};
