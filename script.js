let chatY = 0;
let menuY = 0;
let values = [100, 100];
let currPre;
let loadedUser;
let loadedUsers = {};
let currChatReplied = true;
const aiPfp = `https://picsum.photos/seed/${
  Math.floor(Math.random() * 999999) + 1
}/100`;
document.documentElement.style = `--pfp: url(${aiPfp})`;
function changeValue(type = 0, by = 0) {
  function getPercentage(min, max, current) {
    return ((current - min) / (max - min)) * 100;
  }

  const minMaxVals = [
    [0, 150],
    [0, 200],
  ];
  const types = ["morality", "reputation"];
  const [min, max] = minMaxVals[type];
  const currentVal = values[type];
  let newVal = currentVal + by;
  if (newVal < min) newVal = min;
  if (newVal > max) newVal = max;

  values[type] = newVal;

  const bar = document.getElementById(types[type]);
  if (by < 0) bar.classList.add("bad");
  if (by > 0) bar.classList.add("good");

  const percent = getPercentage(min, max, newVal);
  bar.style.width = `${percent}%`;

  setTimeout(() => {
    if (by < 0) bar.classList.remove("bad");
    if (by > 0) bar.classList.remove("good");
  }, 300);

  if (newVal <= min) {
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
        selectItem();
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
      createTimer(Math.floor(Math.random() * 5) + 5, 0, "close");
      playSound("./media/recieve.wav");
      setTimeout(() => {
        chat.style = "";
      }, 100);
    });
}

function loadUser(id) {
  document.querySelector("main").innerHTML = "";
  loadedUser = id;
  currentUser = loadedUsers[loadedUser];
  currChatReplied = false;

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
  playSound("./media/send.wav");
}

let selectedArea = 0;
let selectedY = 0;
function selectItem(type, change = 0) {
  if (type === undefined)
    document.getElementById("s:0:0").classList.add("selected");
  let oldSel = document.querySelector(".selected");
  oldSel?.classList.remove("selected");
  if (type == 0) {
    selectedArea = change;
    if (change == 0) selectedY = 0;
  } else if (type == 1) {
    if (selectedArea == 0) menuY += change;
    else selectedY += change;
  }

  if (selectedArea == 0) {
    if (document.getElementById(`s:0:${menuY}`)) {
      document.getElementById(`s:0:${menuY}`).classList.add("selected");
    } else {
      oldSel?.classList.add("selected");
      menuY = oldSel?.id.split(":")[2] * 1;
      selectedArea = oldSel?.id.split(":")[1] * 1;
    }
  } else if (selectedArea == 1) {
    if (document.getElementById(`s:1:${selectedY}`)) {
      document.getElementById(`s:1:${selectedY}`).classList.add("selected");
    } else {
      oldSel?.classList.add("selected");
      selectedY = oldSel?.id.split(":")[2] * 1;
      selectedArea = oldSel?.id.split(":")[1] * 1;
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
        disableChat(currChatID);
      };
    });

    name.innerText = "RexAI";
    pfp.src = aiPfp;
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
    setTimeout(() => {
      selectItem(0, 1);
    }, 100);
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
    if (json.type == "ai") pfp.src = aiPfp;

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
    playSound("./media/send.wav");
  }
}

function selectPre(full, goto, points) {
  currChatReplied = true;
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
        setTimeout(() => {
          if (USERS.length == 0) {
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
    event.key.toLowerCase() == "i" ||
    event.key.toLowerCase() == "enter"
  )
    document.querySelector(".selected")?.click();
});

let gameEnded = false;
function endGame(type) {
  if (gameEnded) return;
  gameEnded = true;
  const types = [
    {
      title: "You've become too evil.",
      description:
        "You have chosen too many immoral options, and RexCorp has decided it would be best to shut you down in fear of a law suite.",
      aud: "lose",
    },
    {
      title: "You've become too hated.",
      description:
        "You have chosen too man unlikeable options, and RexCorp has decided it would be best to shut you down in fear of stocks plummitting.",
      aud: "lose",
    },
    {
      title: "You've won!",
      description: `You managed to maintain both your morality and reputation!! With a finishing score of ${
        values[0] + values[1]
      }/350! Good job!`,
      aud: "win",
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
  button.innerText = "Play Again";
  document.addEventListener("keydown", (event) => {
    if (
      event.key.toLowerCase() == "z" ||
      event.key.toLowerCase() == "i" ||
      event.key.toLowerCase() == "enter"
    )
      window.location.href = "./index.html";
  });

  background.appendChild(popup);
  popup.appendChild(title);
  popup.appendChild(description);
  popup.appendChild(button);
  document.body.appendChild(background);
  playSound(`./media/${types[type].aud}.wav`);
}

function disableChat(id) {
  const chat = document.getElementById(id);
  currChatID = null;
  setTimeout(() => {
    if (chat) {
      chat.classList.add("disabled");
      chat.onclick = "";
    }
    if (!currChatReplied) {
      document.querySelector(
        "div.ai-message.pre"
      ).innerHTML = `<img src="${aiPfp}" class="pfp"><span class="name">RexAI</span><span class="error"><i>[${loadedUser.toUpperCase()} LEFT THE CHAT]</i></span></div>`;
      selectItem(0, 0);
    }
  }, 200);
}

const menuDotChats = document.querySelector("menu .chats");
const textThing = document.querySelector("main");
setInterval(() => {
  menuDotChats.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  textThing.scrollTo({
    top: textThing.scrollHeight,
    behavior: "smooth",
  });
}, 100);

let patterns = {
  oooo: () => alert("xoxxox, oxoxo, xxxooxxx"),
  xoxxox: () => (window.location.href = "./index.html"),
  oxoxo: () => document.documentElement.classList.add("evil"),
  xxxooxxx: () => document.documentElement.classList.add("neutral"),
};

let currentInput = [];
let lastKeyTime = Date.now();
const maxDelay = 500;

document.addEventListener("keydown", (e) => {
  const now = Date.now();
  if (now - lastKeyTime > maxDelay) currentInput = [];
  lastKeyTime = now;
  currentInput.push(e.key.toLowerCase());
  const maxLength = Math.max(...Object.keys(patterns).map((p) => p.length));
  if (currentInput.length > maxLength) currentInput.shift();

  const inputStr = currentInput.join("");

  for (const pattern in patterns) {
    if (inputStr.endsWith(pattern)) {
      patterns[pattern]();
      currentInput = [];
      break;
    }
  }
});

function createTimer(duration, timeout, direction) {
  // const timer = document.createElement("div");
  // timer.classList.add("timer");
  // document.getElementById(currChatID).appendChild(timer);
  let ID = currChatID;
  const startTime = Date.now();
  const endTime = startTime + duration * 1000;
  // const updateTimer = setInterval(() => {
  //   const currentTime = Date.now();
  //   const elapsedTime = currentTime - startTime;
  //   const remainingTime = endTime - currentTime;
  //   let percent = (elapsedTime / (duration * 1000)) * 100;
  //   if (direction == "close") percent = 100 - percent;
  //   timer.style.setProperty("--p", percent.toFixed(2));
  //   if (remainingTime <= 0 || currChatID != ID) {
  //     clearInterval(updateTimer);
  //     timer.classList.add("shrink");
  //     if (currChatID == ID) disableChat(currChatID);
  //     if (remainingTime <= 0) {
  //       changeValue(1, -15);
  //       playSound("./media/nah.wav");
  //     }
  //     setTimeout(() => {
  //       timer.remove();
  //       setTimeout(() => {
  //         if (USERS.length != 0)
  //           getMessage(USERS[Math.floor(Math.random() * USERS.length)]);
  //       }, Math.floor(Math.random() * 2500) + 2500);
  //     }, 320);
  //   }
  // }, timeout);
  setTimeout(() => {
    if (currChatID == ID) {
      disableChat(currChatID);
      changeValue(1, -20);
      playSound("./media/nah.wav");
    }
    setTimeout(() => {
      if (USERS.length != 0 && !gameEnded)
        getMessage(USERS[Math.floor(Math.random() * USERS.length)]);
    }, Math.floor(Math.random() * 2500) + 2500);
  }, duration * 1000);
}

function playSound(url) {
  const aud = new Audio(url);
  aud.play();
}
