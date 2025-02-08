const express = require("express");
const app = express();
const serv = require("http").Server(app);

app.get("/",
        function(req, res) { res.sendFile(__dirname + "/client/index.html"); });
app.use("/client", express.static(__dirname + "/client"));

serv.listen(2000);

console.log("Server Running");

const io = require("socket.io")(serv, {});

const socketList = {};
io.sockets.on("connection", function(socket) {
  console.log("Client Connected");

  // sends initial asset data to the client appon connecting:
  socket.emit("assetData", assetList.data);

  const id = Math.random();
  socketList[id] = socket;
});

class Asset {
  constructor(name, initVal) {
    this.name = name;
    this.value = initVal;
  }
}

class AssetList {
  constructor() { this.assets = {}; }

  addAsset(name, val) { this.assets[name] = new Asset(name, val); }

  get data() {
    const data = {};
    for (let name in this.assets) {
      data[name] = this.assets[name].value;
    }
    return data;
  }
}

const assetList = new AssetList();
assetList.addAsset("potion", 100);
assetList.addAsset("sword", 100);
assetList.addAsset("mushroom", 100);
assetList.addAsset("ironOre", 100);