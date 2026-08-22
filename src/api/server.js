import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import userRouter from "./user/userRouter.js";
import propertyRouter from "./property/propertyRouter.js";
import rentalRouter from "./rental/rentalRouter.js"
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users",userRouter);
app.use("/api/properties",propertyRouter);
app.use("/api/rentals",rentalRouter);

app.get("/", (req, res) => {
  res.json({ message: "Real Estate API Running" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
