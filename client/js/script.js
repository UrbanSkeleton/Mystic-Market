const socket = io();

socket.on("helloWorld", function() { console.log("hello world"); });