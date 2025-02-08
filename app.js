import express from "express";
import http from "http";
import path from "path";
import {Server as SocketIOServer} from "socket.io";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GameServer {
  constructor() {
    this.port = process.env.PORT || 3000;

    this.initServer();
  }

  initServer() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server);

    this.setupRoutes();
    this.setupSocketEvents();

    this.server.listen(
        this.port,
        () => { console.log(`Server running on port ${this.port}`); });
  }

  setupRoutes() {
    this.app.use("/shared", express.static(path.join(__dirname, "shared")));
    this.app.use("/client", express.static(path.join(__dirname, "client")));

    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "client", "index.html"));
    });
  }

  setupSocketEvents() {}
}

new GameServer();