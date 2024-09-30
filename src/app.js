const express = require("express");
const cors = require("cors");
const app = express();
const apiRouter = require("./api/api.router");


// Middleware

app.use(
  cors({
      origin: [
          "https://auth-microservies-landing.onrender.com",
          "http://localhost:3000"
      ],
  })
);
app.use(express.json());


// Routes

app.use("/requestApi", apiRouter);



// 404 Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error(`Path not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  console.log(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;
