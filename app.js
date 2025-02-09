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
  constructor(name, initVal = Math.random() * 99 + 1) {
    this.name = name;
    this.value = initVal;
    this.increase = 0;
  }
}

class AssetList {
  constructor() {
    this.assets = {};
    this.lowerBound = 0.95;
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
      // if (Math.random() <= 0.01)
      //   asset.increase = 0.2;
      // else if (Math.random() <= 0.01)
      //   asset.increase = 5;
      // else
      asset.increase = this.lowerBound +
                       (Math.random() * (this.upperBound - this.lowerBound));
      asset.value *= asset.increase;
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

setInterval(update, assetList.updateTime * 1000);