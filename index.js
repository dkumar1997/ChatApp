const { disconnect } = require("process");

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
  totalPeople = totalPeople + 1;
  let person = {
    username: "User" + totalPeople,
    color: "RRGGBB",
  };
  usernames.push(person.username);
  socket.emit("welcome", "You are " + person.username);
  io.emit("addingYou", {
    username: person.username,
    allusernames: usernames,
  });
  socket.on("chat message", (msg) => {
    let datetime = new Date();
    let dateString =
      datetime.getMinutes() <= 9
        ? datetime.getHours() + ":0" + datetime.getMinutes()
        : datetime.getHours() + ":" + datetime.getMinutes();
    if (msg[0] == "/") {
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
            io.emit("addingYou", {
              username: person.username,
              allusernames: usernames,
            });
          } else {
            console.log("this username is already being used");
          }
        } else if (changeMsg[0] == "/color") {
          let newColor = changeMsg[1];
          person.color = newColor;
          socket.emit("colorChange", {
            username: person.username,
            color: person.color,
          });
        } else {
          console.log("This is not a valid command");
        }
      } else {
        console.log("This is not a valid command");
      }
    } else {
      io.emit("chat message", dateString + " " + person.username + " " + msg);
    }
  });
  socket.on("disconnect", () => {
    for (let i = 0; i < usernames.length; i++) {
      console.log(usernames[i]);
      if (usernames[i] == person.username) {
        usernames.splice(i, 1);
      }
    }

    io.emit("addingYou", {
      username: person.username,
      allusernames: usernames,
    });
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
