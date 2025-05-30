var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var port = 3000;
var db = "mongodb://localhost:27017/blog-collaborator";
const dotenv = require("dotenv");
dotenv.config();
var authRoutes = require("./routes/authRoutes");
var userRoutes = require("./routes/userRoutes");

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
