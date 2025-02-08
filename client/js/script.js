const socket = io();

let assetData;

socket.on("assetData", function(data) { assetData = data; });