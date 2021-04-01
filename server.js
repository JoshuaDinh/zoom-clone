const express = require("express");
const app = express();
// Creates server based on express server
const server = require("http").Server(app);
// Passes server to socket.io
const io = require("socket.io")(server);
// Gets randomly generated id
const { v4: uuidv4 } = require("uuid");

// Setup for peer server to generate unique user ids
const { PeerServer } = require("peer");
const peerServer = PeerServer({ port: 3001, path: "/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Runs anytime users connects to webpage, server side event listeners
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // send to everyone in the room except sender
    socket.to(roomId).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});
server.listen(3000);
