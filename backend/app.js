const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = 3000;
const db = "mongodb://localhost:27017/blog-collaborator";
const dotenv = require("dotenv");
const cors = require("cors");
const webSocketService = require("./wss/WebSocketService");

dotenv.config();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Map();

webSocketService.setClients(clients);

wss.on("connection", (ws) => {
  console.log("New client connected");
  let userId;

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === "REGISTER" && parsedMessage.userId) {
        userId = parsedMessage.userId;
        clients.set(userId, ws);
        console.log(`Client registered with userId: ${userId}`);
        ws.send(
          JSON.stringify({
            type: "REGISTER_SUCCESS",
            message: "Registered successfully",
          })
        );
      }
    } catch (e) {
      console.error(
        "Failed to parse message or invalid message format:",
        message,
        e
      );
      ws.send(
        JSON.stringify({ type: "ERROR", message: "Invalid message format." })
      );
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${userId || "unknown"}`);
    if (userId) {
      clients.delete(userId);
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${userId || "unknown"}:`, error);
    if (userId) {
      clients.delete(userId);
    }
  });
});

function sendNotificationToUser(userId, notificationData) {
  return webSocketService.sendNotificationToUser(userId, notificationData);
}

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

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
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", function (req, res) {
  console.log("app starting on port: " + port);
  res.send("tes express nodejs mongodb");
});

server.listen(port, function () {
  console.log("app listening on port: " + port);
});

module.exports = { app, wss, sendNotificationToUser };
