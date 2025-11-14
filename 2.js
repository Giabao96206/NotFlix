const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const NodeCache = require("node-cache");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(
  cors({
    origin: "http://localhost:3000", // FE của bạn
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Session setup
app.use(
  session({
    secret: "chatSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // nên đặt true nếu chạy HTTPS
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "uploads")));

//  Cache file "public"
const staticOptions = {
  maxAge: "30d",
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "public, max-age=2592000");
  },
};
app.use(express.static(path.join(__dirname, "public"), staticOptions));

// Set Pug view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Load controllers API
const fs = require("fs");
const controllersPath = path.join(__dirname, "controllers", "API");

function loadControllers(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadControllers(fullPath);
    } else if (file.endsWith(".js")) {
      const controller = require(fullPath);
      if (typeof controller === "function") {
        controller(app, io);
      }
    }
  });
}

loadControllers(controllersPath);
require("./router/client/index.router")(app, io);

// Lắng nghe server
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
