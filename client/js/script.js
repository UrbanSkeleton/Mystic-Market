const socket = io();
let assetData;
let holdings;
const marketHistory = [];
let selectedAsset = "Healing Potion";
let portValue = 500;
let prevPortValue = 500;

let gold = 500;

function rnd(val) { return Math.round(val * 100) / 100; }

// Function to update the market list
function updateMarketList() {
  let total = 0;
  let amount = 0;
  const marketList = document.querySelector("#market-list");
  marketList.innerHTML = "";

  for (let name in assetData) {
    const asset = assetData[name];
    let increaseText = asset.increase >= 0 ? "+" + rnd((asset.increase)) + "%"
                                           : "" + rnd((asset.increase)) + "%";
    const marketElement = document.createElement("div");
    marketElement.className = "market-elem";
    marketElement.innerHTML = `${name} - ${rnd(asset.value)} (${increaseText})`;

    marketList.appendChild(marketElement);
    amount += 1;
    total += asset.value;
  }
  marketList.innerHTML += "<br>AVERAGE: " + rnd(total / amount);
  updateGraph();
}

function updateHoldingsList() {
  const holdingList = document.querySelector("#holdings-list");
  holdingList.innerHTML = "";

  prevPortValue = portValue;
  portValue = gold;

  for (let name in holdings) {
    const amount = holdings[name];

    const holdingElement = document.createElement("div");
    holdingElement.className = "holding-elem";
    holdingElement.innerHTML = `${name} - ${amount}`;
    holdingList.appendChild(holdingElement);

    portValue += amount * assetData[name].value;
  }

  document.getElementById("portValue").innerHTML =
      "Portfolio Value: " + rnd(portValue);
  document.getElementById("gain").innerHTML =
      "Today's Gain: " +
      rnd((portValue - prevPortValue) / prevPortValue * 100) + "%";
}

// Event listener for dropdown selection change
document.getElementById("asset-dropdown")
    .addEventListener("change", function() {
      selectedAsset = this.value;
      updateGraph();
    });

socket.on("assetData", function(data) {
  assetData = data;
  marketHistory.unshift(assetData);
  if (marketHistory.length > 90)
    marketHistory.pop();
  updateMarketList();
});

socket.on("holdingsUpdate", function(data) {
  holdings = data;
  updateHoldingsList();
});

socket.on("goldUpdate", function(data) {
  gold = data;
  document.getElementById("coins").innerHTML = rnd(gold);
});

socket.on("newEvent", function(data) {
  const newsFeed = document.getElementById("news-feed");
  const newsItem = document.createElement("div");
  newsItem.classList.add("p-2", "border-b", "border-gray-700");
  newsItem.innerHTML = `<strong>${data.event}</strong>: ${
      data.description} <span class='text-gray-400 text-sm'>(${
      new Date().toLocaleTimeString()})</span>`;
  newsFeed.prepend(newsItem);
})

document.getElementById("buyButton").onclick =
    function() { socket.emit("buy", {name : selectedAsset, amount : 1}); };
document.getElementById("sellButton").onclick =
    function() { socket.emit("sell", {name : selectedAsset, amount : 1}); };
document.getElementById("buy10Button").onclick =
    function() { socket.emit("buy", {name : selectedAsset, amount : 10}); };
document.getElementById("sell10Button").onclick =
    function() { socket.emit("sell", {name : selectedAsset, amount : 10}); };