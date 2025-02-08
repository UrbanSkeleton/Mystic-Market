const socket = io();

let assetData;

function rnd(val) { return Math.round(val * 100) / 100; }

function updateMarketList() {
  let total = 0;
  let amount = 0;
  const marketList = document.querySelector("#market-list");
  marketList.innerHTML = "";
  for (let name in assetData) {
    const asset = assetData[name];
    let increaseText;
    if (asset.increase >= 1)
      increaseText = "+" + rnd((asset.increase - 1) * 100) + "%";
    else
      increaseText = "" + rnd((asset.increase - 1) * 100) + "%";

    const marketElement = document.createElement("div");
    marketElement.className = "market-elem"
    marketElement.innerHTML = `${name} - ${rnd(asset.value)} (${increaseText})`;
    marketList.appendChild(marketElement);

    amount += 1;
    total += asset.value;
  }

  marketList.innerHTML += "\navg: " + total / amount;
}

socket.on("assetData", function(data) {
  assetData = data;
  updateMarketList();
});