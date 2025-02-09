const express = require("express");
const app = express();
const serv = require("http").Server(app);

app.get("/",
        function(req, res) { res.sendFile(__dirname + "/client/index.html"); });
app.get("/tips",
        function(
            req,
            res) { res.sendFile(__dirname + "/client/investment_tips.html"); });
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

function rand(min, max) { return min + Math.random() * (max - min); }

class Asset {
  constructor(name, initVal = rand(1, 100)) {
    this.name = name;
    this.value = initVal;
    this.prev = this.value;
  }
}

class AssetList {
  constructor() {
    this.assets = {};
    this.updateTime = 1;
  }

  addAsset(name, val) { this.assets[name] = new Asset(name, val); }

  get data() {
    const data = {};
    for (let name in this.assets) {
      data[name] = {
        value : this.assets[name].value,
        increase : this.assets[name].value - this.assets[name].value,
      };
    }
    return data;
  }

  updateMarket() {
    for (let name in this.assets) {
      const asset = this.assets[name];
      const increase = rand(-3, 3);
      asset.value += increase;
      asset.value = Math.max(1, asset.value);
    }
  }
}

const assetList = new AssetList();
assetList.addAsset("Enchanted Sword");
assetList.addAsset("Cursed Dagger");
assetList.addAsset("Dragonbone Bow");
assetList.addAsset("Runed Shield");
assetList.addAsset("Mithril Armor");
assetList.addAsset("Healing Potion");
assetList.addAsset("Mana Elixir");
assetList.addAsset("Invisibility Draught");
assetList.addAsset("Luck Tonic");
assetList.addAsset("Elixir of Immortality");
assetList.addAsset("Phoenix Feather");
assetList.addAsset("Shadow Essence");
assetList.addAsset("Starlit Crystal");
assetList.addAsset("Troll’s Blood");
assetList.addAsset("Fairy Dust");
assetList.addAsset("Baby Gryphon");
assetList.addAsset("Miniature Dragon");
assetList.addAsset("Dire Wolf Pup");
assetList.addAsset("Magic Scrolls");
assetList.addAsset("Ancient Relics");

function update() {
  assetList.updateMarket();
  for (let id in socketList) {
    socketList[id].emit("assetData", assetList.data);
  }
}

setInterval(update, assetList.updateTime * 10);