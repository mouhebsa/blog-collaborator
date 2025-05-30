const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = 3000;
const db = "mongodb://localhost:27017/blog-collaborator";
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", function (req, res) {
  console.log("app starting on port: " + port);
  res.send("tes express nodejs mongodb");
});

app.listen(port, function () {
  console.log("app listening on port: " + port);
});
