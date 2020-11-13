var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/styles.css", (req, res) => {
  res.sendFile(__dirname + "/styles.css");
});

let totalPeople = 0;
let usernames = [];
io.on("connection", (socket) => {
  totalPeople += 1;
  let person = {
    username: "User" + totalPeople,
    color: "none",
  };
  usernames.push(person.username);
  socket.emit("welcome", "You are " + person.username);

  socket.on("initial message", (msg) => {
    if (msg[0] == "/") {
      changeUserColor(msg);
    } else {
      socket.emit("initial message", {
        msg: msg,
        time: buildTime(),
        person: person,
      });
    }
  });
  socket.on("sendEveryoneElse", (msg) => {
    socket.broadcast.emit("sendEveryoneElse", msg);
  });
  socket.on("disconnect", () => {
    for (let i = 0; i < usernames.length; i++) {
      console.log(usernames[i]);
      if (usernames[i] == person.username) {
        usernames.splice(i, 1);
      }
    }
  });

  function buildTime() {
    let datetime = new Date();
    let dateString =
      datetime.getMinutes() <= 9
        ? datetime.getHours() + ":0" + datetime.getMinutes()
        : datetime.getHours() + ":" + datetime.getMinutes();
    return dateString;
  }
  function changeUserColor(msg) {
    let changeMsg = msg.split(" ");
    if (changeMsg.length == 2) {
      if (changeMsg[0] == "/name") {
        let newUsername = changeMsg[1];
        if (!usernames.includes(newUsername)) {
          for (let i = 0; i < usernames.length; i++) {
            if (usernames[i] == person.username) {
              usernames[i] = newUsername;
            }
          }
          person.username = newUsername;
          socket.emit("welcome", "You are " + person.username);
        } else {
          socket.emit("welcome", "This username is already taken.");
        }
      } else if (changeMsg[0] == "/color") {
        if (changeMsg[1].length == 6) {
          let newColor = changeMsg[1];
          person.color = newColor;
          io.emit("colorchange", person);
        } else {
          socket.emit("welcome", "This is an invalid HEX value.");
        }
      } else {
        socket.emit("welcome", "This is an invalid command.");
      }
    } else {
      socket.emit("welcome", "This is an invalid command.");
    }
  }
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
