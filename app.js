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
const userList = {};
io.sockets.on("connection", function(socket) {
  console.log("Client Connected");

  // sends initial asset data to the client appon connecting:
  socket.emit("assetData", assetList.data);

  const id = Math.random();
  socketList[id] = socket;

  userList[id] = new User(socket);
});

function rand(min, max) { return min + Math.random() * (max - min); }

class User {
  constructor(socket, gold = 500) {
    this.socket = socket;

    this.gold = gold;
    this.ownedAssets = {};
    for (let name in assetList.assets) {
      const asset = assetList[name];
      this.ownedAssets[name] = 0;
    }

    this.sendUpdates();

    this.socket.on("buy", (data) => {
      const value = assetList.assets[data.name].value;
      const cost = value * data.amount;
      if (this.gold > cost) {
        this.gold -= cost;
        this.ownedAssets[data.name] += data.amount
      }
      this.sendUpdates();
    });

    this.socket.on("sell", (data) => {
      const value = assetList.assets[data.name].value;
      const cost = value * data.amount;
      if (this.ownedAssets[data.name] >= data.amount) {
        this.gold += cost;
        this.ownedAssets[data.name] -= data.amount;
      }
      this.sendUpdates();
    });
  }

  sendHoldingUpdate() { this.socket.emit("holdingsUpdate", this.ownedAssets); }

  sendGoldUpdate() { this.socket.emit("goldUpdate", this.gold) }

  sendUpdates() {
    this.sendGoldUpdate();
    this.sendHoldingUpdate();
  }
}

class Asset {
  constructor(name, initVal = rand(1, 100)) {
    this.name = name;
    this.value = initVal;
    this.resting = initVal;
    this.mode = Math.floor(rand(0, 6));
    this.modeDuration = Math.floor(rand(10, 200));
    this.prev = this.value;
  }
}

class AssetList {
  constructor() {
    this.assets = {};
    this.updateTime = 15;
  }

  addAsset(name, val) { this.assets[name] = new Asset(name, val); }

  get data() {
    const data = {};
    for (let name in this.assets) {
      const a = this.assets[name]
      data[name] = {
        value : a.value,
        increase : (a.value - a.prev) / a.prev * 100,
      };
    }
    return data;
  }

  updateMarket() {
    for (let name in this.assets) {
      const asset = this.assets[name];
      asset.prev = asset.value;

      asset.value += (asset.resting - asset.value) * 0.04;

      if (Math.random() < 0.1)
        asset.value += rand(-0.5, 0.5);

      switch (asset.mode) {
      case 0:
        asset.value += rand(-0.1, 0.1);
        if (Math.random() < 0.15)
          asset.value += rand(-0.2, 0.2);
        break;
      case 1:
        asset.value += rand(-0.05, 0.2);
        if (Math.random() < 0.05)
          asset.value += rand(-0.2, 0.2);
        break;
      case 2:
        asset.value += rand(-0.2, 0.05);
        if (Math.random() < 0.05)
          asset.value += rand(-1, 1);
        break;
      case 3:
        asset.value += rand(0, 0.35) + rand(0, 0.35);
        if (Math.random() < 0.2)
          asset.value += rand(-2, 5);
        break;
      case 4:
        asset.value += rand(-0.35, 0) + rand(-0.35, 0);
        if (Math.random() < 0.2)
          asset.value += rand(-5, 2);
        break;
      case 5:
        asset.value += rand(-1, 1);
        if (Math.random() < 0.50)
          asset.value += rand(-2, 2);
        if (Math.random() < 0.25)
          asset.value += rand(-4, 4);
        if (Math.random() < 0.125)
          asset.value += rand(-8, 8);
        break;
      case 6:
        asset.value += rand(5, 20);
        if (Math.random < 0.1)
          asset.mode = Math.floor(3, 6);
        if (asset.modeDuration > 4)
          asset.modeDuration = Math.floor(rand(2, 4));
        break;
      case 7:
        asset.value *= rand(0.5, 0.9);
        if (Math.random < 0.1)
          asset.mode = Math.floor(0, 3);
        if (asset.modeDuration > 4)
          asset.modeDuration = Math.floor(rand(2, 4));
        break;
      }

      if (asset.modeDuration-- <= 0) {
        asset.modeDuration = Math.floor(rand(10, 200));
        if (Math.random() < 0.6)
          asset.mode = Math.floor(rand(0, 3));
        else
          asset.mode = Math.floor(rand(3, 6));
      }

      else if (Math.random() < 0.03)
        asset.mode = Math.floor(rand(0, 3));

      asset.value = Math.max(1, asset.value);
      asset.value = Math.min(asset.resting * 4, asset.value);

      asset.value += rand(0, 2);
    }
  }
}

const assetList = new AssetList();
assetList.addAsset("Healing Potion", 10);
assetList.addAsset("Mana Elixir", 12);
assetList.addAsset("Invisibility Draught", 15);
assetList.addAsset("Luck Tonic", 18);
assetList.addAsset("Troll’s Blood", 20);
assetList.addAsset("Fairy Dust", 25);
assetList.addAsset("Magic Scrolls", 30);
assetList.addAsset("Shadow Essence", 35);
assetList.addAsset("Phoenix Feather", 40);
assetList.addAsset("Starlit Crystal", 50);
assetList.addAsset("Ancient Relics", 60);
assetList.addAsset("Runed Shield", 75);
assetList.addAsset("Cursed Dagger", 80);
assetList.addAsset("Enchanted Sword", 100);
assetList.addAsset("Dragonbone Bow", 120);
assetList.addAsset("Mithril Armor", 150);
assetList.addAsset("Baby Gryphon", 160);
assetList.addAsset("Dire Wolf Pup", 170);
assetList.addAsset("Miniature Dragon", 190);
assetList.addAsset("Elixir of Immortality", 200);

function update() {
  let news = null;
  if (Math.random() < 0.3)
    news = newsList[Math.floor(rand(0, newsList.length))];
  if (news) {
    for (let e of news.effects) {
      assetList.assets[e.asset].mode = e.effect;
      assetList.assets[e.asset].modeDuration = Math.floor(10, 200);
    }
  }

  assetList.updateMarket();
  for (let id in userList) {
    userList[id].sendUpdates();
    userList[id].socket.emit("assetData", assetList.data);
    if (news)
      userList[id].socket.emit("newEvent", news);
  }
}

const newsList = [
  {
    event : "📈 Legendary Blacksmith Returns",
    description :
        "A master smith enhances enchanted swords, slightly increasing demand.",
    effects : [ {asset : "Enchanted Sword", effect : 1} ]
  },
  {
    event : "📉 Magic Ban Enforced",
    description :
        "Local authorities outlaw enchanted weaponry, reducing value slightly.",
    effects : [
      {asset : "Enchanted Sword", effect : 3},
      {asset : "Cursed Dagger", effect : 3}
    ]
  },
  {
    event : "📈 Assassins' Guild Expansion",
    description :
        "A rising demand for stealth weapons leads to a moderate increase in prices.",
    effects : [
      {asset : "Cursed Dagger", effect : 2},
      {asset : "Invisibility Draught", effect : 1}
    ]
  },
  {
    event : "📉 Curse Removal Ritual Discovered",
    description :
        "A way to cleanse curses makes these daggers slightly less desirable.",
    effects : [ {asset : "Cursed Dagger", effect : 2} ]
  },
  {
    event : "📈 Dragon Sightings Increase",
    description :
        "More dragons mean more need for specialized hunting weapons.",
    effects : [ {asset : "Dragonbone Bow", effect : 2} ]
  },
  {
    event : "📉 Dragon Conservation Act",
    description : "Hunting bans make dragonbone bows harder to sell.",
    effects : [ {asset : "Dragonbone Bow", effect : 3} ]
  },
  {
    event : "📈 Ancient Rune Rediscovered",
    description :
        "Scholars decipher old runes, slightly improving the shield’s power.",
    effects : [ {asset : "Runed Shield", effect : 1} ]
  },
  {
    event : "📉 Magic Wane",
    description : "A surge of anti-magic energy weakens all enchanted items.",
    effects : [
      {asset : "Enchanted Sword", effect : 3},
      {asset : "Runed Shield", effect : 3}, {asset : "Mana Elixir", effect : 3},
      {asset : "Magic Scrolls", effect : 2}
    ]
  },
  {
    event : "📈 Dwarven Mines Reopen",
    description :
        "A new source of mithril is found, increasing its availability.",
    effects : [ {asset : "Mithril Armor", effect : 1} ]
  },
  {
    event : "📉 Alchemy Breakthrough",
    description :
        "A synthetic alternative reduces the demand for true mithril.",
    effects : [ {asset : "Mithril Armor", effect : 2} ]
  },
  {
    event : "📈 Outbreak of Plague",
    description : "The sick and injured scramble to buy potions.",
    effects : [
      {asset : "Healing Potion", effect : 2},
      {asset : "Troll’s Blood", effect : 1}
    ]
  },
  {
    event : "📉 Herbal Remedy Discovery",
    description : "A cheaper alternative lowers demand for healing potions.",
    effects : [ {asset : "Healing Potion", effect : 3} ]
  },
  {
    event : "📈 Mage Tournament Announced",
    description : "Demand surges as spellcasters prepare for competition.",
    effects : [
      {asset : "Mana Elixir", effect : 2}, {asset : "Magic Scrolls", effect : 1}
    ]
  },
  {
    event : "📉 Anti-Magic Zone Declared",
    description : "Many regions prohibit magic use, reducing sales.",
    effects : [
      {asset : "Mana Elixir", effect : 3}, {asset : "Magic Scrolls", effect : 3}
    ]
  },
  {
    event : "📈 Thieves' Guild War",
    description : "Criminals seek stealth solutions, driving up demand.",
    effects : [ {asset : "Invisibility Draught", effect : 2} ]
  },
  {
    event : "📉 Anti-Invisibility Wards Installed",
    description : "Authorities deploy countermeasures, reducing effectiveness.",
    effects : [ {asset : "Invisibility Draught", effect : 3} ]
  },
  {
    event : "📈 Grand Lottery Opens",
    description : "Superstitious buyers hoard tonics for better odds.",
    effects : [ {asset : "Luck Tonic", effect : 1} ]
  },
  {
    event : "📉 Alchemy Fraud Exposed",
    description : "A scandal reveals that some tonics are mere sugar water.",
    effects : [ {asset : "Luck Tonic", effect : 3} ]
  },
  {
    event : "📈 Ancient King Seeks Eternal Life",
    description : "A wealthy monarch is buying up all known stock.",
    effects : [ {asset : "Elixir of Immortality", effect : 2} ]
  },
  {
    event : "📉 Potion Side Effects Discovered",
    description :
        "Users report strange transformations instead of immortality.",
    effects : [ {asset : "Elixir of Immortality", effect : 3} ]
  },
  {
    event : "🔥 The Great Arcane Collapse",
    description :
        "A catastrophic failure in the magical weave causes spells to fizzle, enchanted items to malfunction, and magical creatures to suffer.",
    effects : [
      {asset : "Enchanted Sword", effect : 7},
      {asset : "Cursed Dagger", effect : 7},
      {asset : "Dragonbone Bow", effect : 6},
      {asset : "Runed Shield", effect : 7},
      {asset : "Mithril Armor", effect : 5},
      {asset : "Healing Potion", effect : 7},
      {asset : "Mana Elixir", effect : 7},
      {asset : "Invisibility Draught", effect : 6},
      {asset : "Luck Tonic", effect : 5},
      {asset : "Elixir of Immortality", effect : 7},
      {asset : "Phoenix Feather", effect : 6},
      {asset : "Shadow Essence", effect : 7},
      {asset : "Starlit Crystal", effect : 5},
      {asset : "Troll’s Blood", effect : 6},
      {asset : "Fairy Dust", effect : 7},
      {asset : "Baby Gryphon", effect : 6},
      {asset : "Miniature Dragon", effect : 7},
      {asset : "Dire Wolf Pup", effect : 5},
      {asset : "Magic Scrolls", effect : 7},
      {asset : "Ancient Relics", effect : 5}
    ]
  },
  {
    event : "🌊 The Flood of Ages",
    description :
        "A magical flood washes across the land, drowning trade routes, redistributing rare artifacts, and making certain assets skyrocket while others vanish.",
    effects : [
      {asset : "Enchanted Sword", effect : 6},
      {asset : "Cursed Dagger", effect : 5},
      {asset : "Dragonbone Bow", effect : 7},
      {asset : "Runed Shield", effect : 5},
      {asset : "Mithril Armor", effect : 6},
      {asset : "Healing Potion", effect : 6},
      {asset : "Mana Elixir", effect : 6},
      {asset : "Invisibility Draught", effect : 7},
      {asset : "Luck Tonic", effect : 6},
      {asset : "Elixir of Immortality", effect : 7},
      {asset : "Phoenix Feather", effect : 5},
      {asset : "Shadow Essence", effect : 6},
      {asset : "Starlit Crystal", effect : 7},
      {asset : "Troll’s Blood", effect : 5},
      {asset : "Fairy Dust", effect : 6},
      {asset : "Baby Gryphon", effect : 7},
      {asset : "Miniature Dragon", effect : 5},
      {asset : "Dire Wolf Pup", effect : 7},
      {asset : "Magic Scrolls", effect : 7},
      {asset : "Ancient Relics", effect : 6}
    ]
  },
  {
    event : "⚡ The Rift Opens",
    description :
        "A dimensional rift unleashes chaos, flooding the world with unpredictable energy. Some items gain immense power while others become useless.",
    effects : [
      {asset : "Enchanted Sword", effect : 5},
      {asset : "Cursed Dagger", effect : 6},
      {asset : "Dragonbone Bow", effect : 7},
      {asset : "Runed Shield", effect : 4},
      {asset : "Mithril Armor", effect : 7},
      {asset : "Healing Potion", effect : 5},
      {asset : "Mana Elixir", effect : 6},
      {asset : "Invisibility Draught", effect : 7},
      {asset : "Luck Tonic", effect : 7},
      {asset : "Elixir of Immortality", effect : 4},
      {asset : "Phoenix Feather", effect : 7},
      {asset : "Shadow Essence", effect : 6},
      {asset : "Starlit Crystal", effect : 6},
      {asset : "Troll’s Blood", effect : 5},
      {asset : "Fairy Dust", effect : 7},
      {asset : "Baby Gryphon", effect : 4},
      {asset : "Miniature Dragon", effect : 6},
      {asset : "Dire Wolf Pup", effect : 7},
      {asset : "Magic Scrolls", effect : 5},
      {asset : "Ancient Relics", effect : 7}
    ]
  }
];

for (let i = 0; i < 10; i++)
  update();

setInterval(update, assetList.updateTime * 1000);