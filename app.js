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
    this.increase = 0;
  }
}

class AssetList {
  constructor() {
    this.assets = {};
    this.lowerBound = 0.99;
    this.upperBound = 1 / this.lowerBound;
    this.updateTime = 1;
  }

  addAsset(name, val) { this.assets[name] = new Asset(name, val); }

  get data() {
    const data = {};
    for (let name in this.assets) {
      data[name] = {
        value : this.assets[name].value,
        increase : this.assets[name].increase,
      };
    }
    return data;
  }

  updateMarket() {
    for (let name in this.assets) {
      const asset = this.assets[name];
      asset.increase = this.lowerBound +
                       (Math.random() * (this.upperBound - this.lowerBound));
      asset.value *= asset.increase;
    }
  }
}

const assetList = new AssetList();
assetList.addAsset("Enchanted Sword", 100);
assetList.addAsset("Cursed Dagger", 100);
assetList.addAsset("Dragonbone Bow ", 100);
assetList.addAsset("Runed Shield", 100);
assetList.addAsset("Mithril Armor ", 100);
assetList.addAsset("Healing Potion", 100);
assetList.addAsset("Mana Elixir ", 100);
assetList.addAsset("Invisibility Draught", 100);
assetList.addAsset("Luck Tonic ", 100);
assetList.addAsset("Elixir of Immortality ", 100);
assetList.addAsset("Phoenix Feather ", 100);
assetList.addAsset("Shadow Essence ", 100);
assetList.addAsset("Starlit Crystal ", 100);
assetList.addAsset("Troll’s Blood", 100);
assetList.addAsset("Fairy Dust ", 100);
assetList.addAsset("Baby Gryphon ", 100);
assetList.addAsset("Miniature Dragon", 100);
assetList.addAsset("Dire Wolf Pup ", 100);
assetList.addAsset("Magic Scrolls", 100);
assetList.addAsset("Ancient Relics", 100);

function update() {
  assetList.updateMarket();
  for (let id in socketList) {
    socketList[id].emit("assetData", assetList.data);
  }
}

setInterval(update, assetList.updateTime * 1000);