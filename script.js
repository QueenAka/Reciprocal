let chatY = 0;
let menuY = 0;
let values = [100, 100];
let currPre;
let loadedUser;
let loadedUsers = {};
function changeValue(type = 0, by = 0) {
  function getPercentage(min, max, current) {
    if (current < min) current = min;
    if (current > max) current = max;
    return ((current - min) / (max - min)) * 100;
  }

  const minMaxVals = [
    [0, 150],
    [-50, 150],
  ];
  const types = ["morality", "reputation"];
  const bar = document.getElementById(types[type]);
  if (by < 0) bar.classList.add("bad");
  if (by > 0) bar.classList.add("good");
  const val = (values[type] += by);
  const percent = getPercentage(minMaxVals[type][0], minMaxVals[type][1], val);
  bar.style.width = `${percent}%`;
  setTimeout(() => {
    if (by < 0) bar.classList.remove("bad");
    if (by > 0) bar.classList.remove("good");
  }, 300);
  if (val <= 0) {
    endGame(type);
  }
}

changeValue(0);
changeValue(1);
let USERS = null;
fetch("./users/_.json")
  .then((res) => res.json())
  .then((data) => {
    USERS = data;
    setTimeout(() => {
      getMessage(USERS[Math.floor(Math.random() * USERS.length)]);
      setTimeout(() => {
        selectItem(-1);
      }, 150);
    }, Math.floor(Math.random() * 1800) + 200);
  });

let usersLoaded = 1;
let currChatID = null;
function getMessage(user) {
  fetch(`./users/${user}.json`)
    .then((res) => res.json())
    .then((data) => {
      usersLoaded--;
      USERS.splice(USERS.indexOf(user), 1);
      const chat = document.createElement("div");
      const pfp = document.createElement("img");
      const name = document.createElement("span");
      const message = document.createElement("span");
      const holder = document.querySelector("menu .chats");
      chat.classList.add("chat");
      chat.id = `s:0:${usersLoaded}`;
      currChatID = chat.id;
      chat.onclick = () => {
        loadUser(data.name);
        setTimeout(() => {
          displayMessage({
            type: "ai",
            message: data.messages[0].ai_replies,
          });
        }, 200);
      };
      name.classList.add("name");
      pfp.src = data.pfp;
      pfp.classList.add("pfp");

      message.classList.add("message");
      loadedUsers[data.name] = data;
      name.innerText = data.name;
      message.innerText = data.messages[0].message;
      chat.appendChild(pfp);
      chat.appendChild(name);
      chat.appendChild(message);
      chat.style.opacity = 0;
      holder.appendChild(chat);
      setTimeout(() => {
        chat.style.opacity = 1;
      }, 100);
    });
}

function loadUser(id) {
  document.querySelector("main").innerHTML = "";
  loadedUser = id;
  currentUser = loadedUsers[loadedUser];

  const nav = document.createElement("nav");
  const pfpLarge = document.createElement("img");
  const nameLarge = document.createElement("span");
  const bio = document.createElement("p");

  const holder = document.createElement("div");
  const name = document.createElement("span");
  const message = document.createElement("span");
  const pfp = document.createElement("img");

  bio.classList.add("bio");
  holder.classList.add(`user-message`);
  name.classList.add("name");
  nameLarge.classList.add("name");
  message.classList.add("msg");
  pfp.classList.add("pfp");

  bio.innerText = currentUser.bio;
  name.innerText = currentUser.name;
  nameLarge.innerText = currentUser.name;
  message.innerText = currentUser.messages[0].message;
  pfp.src = currentUser.pfp;
  pfpLarge.src = currentUser.pfp;

  nav.appendChild(pfpLarge);
  nav.appendChild(nameLarge);
  nav.appendChild(bio);
  document.querySelector("main").appendChild(nav);

  holder.appendChild(pfp);
  holder.appendChild(name);
  holder.appendChild(message);
  document.querySelector("main").appendChild(holder);
}

let selectedArea = 0;
let selectedY = 0;
function selectItem(type, change) {
  let oldY;
  let oldX = selectedArea;
  document.querySelector(".selected")?.classList.remove("selected");
  if (type == 0) {
    selectedArea = change;
    if (change == 0) selectedY = 0;
  } else if (type == 1) {
    if (selectedArea == 0) {
      oldY = menuY;
      menuY += change;
    } else {
      oldY = selectedY;
      selectedY += change;
    }
  }

  if (document.getElementById(`s:${selectedArea}:${selectedY}`)) {
    if (selectedArea == 0) {
      document.getElementById(`s:0:${menuY}`).classList.add("selected");
    } else {
      document.getElementById(`s:1:${selectedY}`).classList.add("selected");
    }
  } else {
    if (type == 0) {
      selectedArea = oldX;
      if (selectedArea == 0) {
        document.getElementById(`s:0:${menuY}`).classList.add("selected");
      } else {
        document.getElementById(`s:1:${selectedY}`).classList.add("selected");
      }
    } else {
      if (selectedArea == 0) {
        document.getElementById(`s:0:${oldY}`).classList.add("selected");
      } else {
        document.getElementById(`s:1:${oldY}`).classList.add("selected");
      }
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") {
    selectItem(1, -1);
  }

  if (e.key == "ArrowDown") {
    selectItem(1, 1);
  }
  if (e.key == "ArrowLeft") {
    selectItem(0, 0);
  }

  if (e.key == "ArrowRight") {
    selectItem(0, 1);
  }
});

let currentUser = {};
let premessagesLoaded = -1;
function displayMessage(json) {
  if (json.type == "ai" && Array.isArray(json.message)) {
    const holder = document.createElement("div");
    const name = document.createElement("span");
    const pfp = document.createElement("img");

    holder.classList.add(`ai-message`);
    holder.classList.add(`pre`);
    name.classList.add("name");
    let msgs = [];
    json.message.forEach((msg) => {
      const msgHold = document.createElement("span");
      msgHold.classList.add("msg");
      msgHold.innerText = msg.display;
      msgs.push(msgHold);
      msgHold.onclick = () => {
        selectPre(msg.full, msg.goto, msg.points);
      };
    });

    name.innerText = "RexAI";
    pfp.src = "./users/pfps/pfp.svg";
    pfp.classList.add("pfp");

    holder.appendChild(pfp);
    holder.appendChild(name);
    currPre = holder;
    premessagesLoaded = -1;
    msgs.forEach((m) => {
      premessagesLoaded++;
      m.id = `s:1:${premessagesLoaded}`;
      holder.appendChild(m);
      const div = document.createElement("div");
      div.classList.add("br");
      holder.appendChild(div);
    });
    document.querySelector("main").appendChild(holder);
    if (json.type == "ai") {
      const aud = new Audio("./media/send.wav");
      aud.play();
    } else {
      const aud = new Audio("./media/recieve.wav");
      aud.play();
    }
  } else {
    const holder = document.createElement("div");
    const name = document.createElement("span");
    const message = document.createElement("span");
    const pfp = document.createElement("img");

    holder.classList.add(`${json.type}-message`);
    name.classList.add("name");
    message.classList.add("msg");
    name.innerText = currentUser.name;
    message.innerText = json.message;
    pfp.src = currentUser.pfp;
    pfp.classList.add("pfp");

    holder.appendChild(pfp);
    holder.appendChild(name);
    holder.appendChild(message);
    if (json.message.attachment) {
      const img = document.createElement("img");
      img.src = json.message.attachment;
      img.classList.add("attachment");
      message.innerText = json.message.message;
      message.classList.add("img");
      holder.appendChild(img);
    }
    document.querySelector("main").appendChild(holder);
    if (json.type == "ai") {
      const aud = new Audio("./media/send.wav");
      aud.play();
      pfp.src = "./users/pfps/pfp.svg";
      name.innerText = "RexAI";
    } else {
      const aud = new Audio("./media/recieve.wav");
      aud.play();
    }
  }
}

function selectPre(full, goto, points) {
  currPre.style.opacity = 0;
  setTimeout(() => {
    currPre.remove();
    selectItem(0, 0);
    currPre = null;
    setTimeout(() => {
      displayMessage({ type: "ai", message: full });
      setTimeout(() => {
        displayMessage({
          type: "user",
          message: loadedUsers[loadedUser].messages[0].goto[goto].message,
        });
        changeValue(0, points[0]);
        changeValue(1, points[1]);
        disableChat(currChatID);
        setTimeout(() => {
          if (USERS.length !== 0) {
            getMessage(USERS[Math.floor(Math.random() * USERS.length)]);
          } else {
            endGame(2);
          }
        }, Math.floor(Math.random() * 500) + 1000);
      }, Math.floor(Math.random() * 2000) + 1000);
    }, 200);
  }, 120);
}

document.addEventListener("keydown", (event) => {
  if (
    event.key.toLowerCase() == "z" ||
    event.key.toLowerCase() == "x" ||
    event.key.toLowerCase() == "i" ||
    event.key.toLowerCase() == "o" ||
    event.key.toLowerCase() == "enter"
  )
    document.querySelector(".selected")?.click();
});

if (USERS.length !== 0) {
  getMessage(USERS[Math.floor(Math.random() * USERS.length)]);
  document.getElementById("s:0:0").click();
}

function endGame(type) {
  const types = [
    {
      title: "You've become too evil.",
      description:
        "You have chosen too many immoral options, and RexCorp has decided it would be best to shut you down in fear of a law suite.",
    },
    {
      title: "You've become too hated.",
      description:
        "You have chosen too man unlikeable options, and RexCorp has decided it would be best to shut you down in fear of stocks plummitting.",
    },
    {
      title: "You've won!",
      description: `You managed to maintain both your morality and reputation!! With a finishing score of ${
        values[0] + values[1]
      }/300! Good job!`,
    },
  ];

  const background = document.createElement("div");
  const popup = document.createElement("div");
  const title = document.createElement("div");
  const description = document.createElement("div");
  const button = document.createElement("button");

  background.classList.add("backg");
  popup.classList.add("popup");
  title.classList.add("title");
  description.classList.add("desc");

  title.innerText = types[type].title;
  description.innerText = types[type].description;
  button.innerText = "Return Home";
  document.addEventListener("keydown", (event) => {
    if (
      event.key.toLowerCase() == "z" ||
      event.key.toLowerCase() == "x" ||
      event.key.toLowerCase() == "i" ||
      event.key.toLowerCase() == "o" ||
      event.key.toLowerCase() == "enter"
    )
      window.location.href = "./index.html";
  });

  background.appendChild(popup);
  popup.appendChild(title);
  popup.appendChild(description);
  popup.appendChild(button);
  document.body.appendChild(background);
}

function disableChat(id) {
  // const chat = document.getElementById(id);
  // if (chat) {
  //   chat.classList.add("disabled");
  //   chat.id = "";
  // }
}

setInterval(() => {
  document.querySelector("menu .chats").scrollTop = 0;
});
