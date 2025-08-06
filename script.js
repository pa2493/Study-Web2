const firebaseConfig = {
  apiKey: "AIzaSyAcOs3hyYea3BM55R5GB-F0hObDbxgNrqA",
  authDomain: "study-web-8cd99.firebaseapp.com",
  databaseURL: "https://study-web-8cd99-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-web-8cd99",
  storageBucket: "study-web-8cd99.firebasestorage.app",
  messagingSenderId: "320613093347",
  appId: "1:320613093347:web:5bb57a0b5c83fdc0e09ad6",
  measurementId: "G-TNZD8GNJFT"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let username = localStorage.getItem("username") || null;
let currentChannel = "general";
let timeStudied = 0;

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const fileInput = document.getElementById("file-input");
const setNameBtn = document.getElementById("set-name-btn");
const timeDisplay = document.getElementById("time");
const toggleThemeBtn = document.getElementById("toggle-theme");

function renderMessage(msg, id) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message";
  msgDiv.innerHTML = `<span>@${msg.user}</span>: ${msg.text} ${msg.file ? `<a href="${msg.file}" target="_blank">📎</a>` : ''}`;
  if (msg.user === username) {
    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = () => db.ref(`${currentChannel}/${id}`).remove();
    msgDiv.appendChild(del);
  }
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function listenForMessages() {
  messagesDiv.innerHTML = "";
  db.ref(currentChannel).on("child_added", snapshot => {
    renderMessage(snapshot.val(), snapshot.key);
  });
  db.ref(currentChannel).on("child_removed", snapshot => {
    document.querySelectorAll(".message").forEach(el => {
      if (el.textContent.includes(snapshot.val().text)) el.remove();
    });
  });
}

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text && !fileInput.files[0]) return;
  const data = {
    user: username || "Anonymous",
    text: text || "",
    time: Date.now()
  };
  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      data.file = e.target.result;
      db.ref(currentChannel).push(data);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    db.ref(currentChannel).push(data);
  }
  messageInput.value = "";
  fileInput.value = "";
};

setNameBtn.onclick = () => {
  const name = prompt("Enter your name:");
  if (name) {
    username = name;
    localStorage.setItem("username", username);
    setNameBtn.style.display = "none";
  }
};

if (username) setNameBtn.style.display = "none";

document.querySelectorAll("#channels li").forEach(li => {
  li.onclick = () => {
    document.querySelector(".active").classList.remove("active");
    li.classList.add("active");
    currentChannel = li.dataset.channel;
    document.getElementById("current-channel").textContent = `# ${li.textContent.trim()}`;
    listenForMessages();
  };
});

toggleThemeBtn.onclick = () => {
  document.body.classList.toggle("light");
};

setInterval(() => {
  timeStudied++;
  timeDisplay.textContent = timeStudied;
  db.ref("ranks/" + username).set(timeStudied);
}, 60000);

db.ref("ranks").on("value", snapshot => {
  const list = document.getElementById("rank-list");
  list.innerHTML = "";
  const ranks = [];
  snapshot.forEach(child => ranks.push({ user: child.key, time: child.val() }));
  ranks.sort((a, b) => b.time - a.time);
  for (const rank of ranks.slice(0, 5)) {
    const li = document.createElement("li");
    li.textContent = `${rank.user}: ${rank.time} mins`;
    list.appendChild(li);
  }
});

listenForMessages();
