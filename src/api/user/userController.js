import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import userModel from "./userModel.js";
import { config } from "../config/config.js";

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return next(
        createHttpError(400, "Password must be at least 6 characters")
      );
    }

    // Check existing user
    const userExists = await userModel.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return next(
        createHttpError(409, "User already exists. Please login.")
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await userModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Create JWT
    const token = jwt.sign(
      {
        sub: newUser._id.toString(),
      },
      config.jwtSecret,
      {
        expiresIn: "30d",
      }
    );

    return res.status(201).json({
      message: "User registered successfully",
      accessToken: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return next(
      createHttpError(500, "Error while registering user")
    );
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return next(
        createHttpError(400, "Email and password are required")
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether email exists
    if (!user) {
      return next(
        createHttpError(401, "Invalid email or password")
      );
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return next(
        createHttpError(401, "Invalid email or password")
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        sub: user._id.toString(),
      },
      config.jwtSecret,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return next(
      createHttpError(500, "Error while logging in")
    );
  }
};

export { registerUser, loginUser };