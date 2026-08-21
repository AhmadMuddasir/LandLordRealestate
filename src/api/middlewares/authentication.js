import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { config } from "../config/config.js";

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return next(
      createHttpError(401, "Access token is required")
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return next(
      createHttpError(401, "Invalid authorization format")
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return next(
      createHttpError(401, "Access token is required")
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwtSecret
    );

    req.userId = decoded.sub;

    next();

  } catch (error) {
    return next(
      createHttpError(
        401,
        "Invalid or expired token"
      )
    );
  }
};

export default authenticate;