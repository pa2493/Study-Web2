//  Firebase Config — Replace with your own
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
let studyStartTime = null;

const channels = document.querySelectorAll("#channels li");
const messagesDiv = document.getElementById("messages");
const form = document.getElementById("msgForm");
const input = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const channelName = document.getElementById("channel-name");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const leaderboard = document.getElementById("rankings");
const setNameBtn = document.getElementById("setNameBtn");
const toggleMode = document.getElementById("toggleMode");

if (!username) {
  setUsername();
} else {
  setNameBtn.style.display = "none";
}

function setUsername() {
  username = prompt("Set your name:");
  if (username) {
    localStorage.setItem("username", username);
    setNameBtn.style.display = "none";
  }
}

setNameBtn.onclick = setUsername;

toggleMode.onclick = () => {
  document.body.classList.toggle("light");
};

channels.forEach((li) => {
  li.onclick = () => {
    document.querySelector(".active")?.classList.remove("active");
    li.classList.add("active");
    currentChannel = li.dataset.channel;
    channelName.textContent = "#" + currentChannel;
    loadMessages();
  };
});

function loadMessages() {
  messagesDiv.innerHTML = "";
  db.ref("channels/" + currentChannel).off();
  db.ref("channels/" + currentChannel).on("child_added", (snapshot) => {
    const { name, text, fileUrl } = snapshot.val();
    const msg = document.createElement("div");
    msg.className = "message";

    let content = `<strong>${name}</strong>: ${highlightPings(text)}`;
    if (fileUrl) {
      content += `<br><a href="${fileUrl}" target="_blank">📎 Attachment</a>`;
    }

    msg.innerHTML = content;

    if (name === username) {
      const del = document.createElement("span");
      del.className = "delete";
      del.textContent = "🗑️";
      del.onclick = () => snapshot.ref.remove();
      msg.appendChild(del);
    }

    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  db.ref("channels/" + currentChannel).on("child_removed", loadMessages);
}

function highlightPings(text) {
  return text.replace(/@(\w+)/g, `<span style="color: #00b0f4;">@$1</span>`);
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const file = fileInput.files[0];
  if (!text && !file) return;

  let fileUrl = null;

  if (file) {
    fileUrl = URL.createObjectURL(file); // Use real upload + URL in production
  }

  db.ref("channels/" + currentChannel).push({ name: username, text, fileUrl });
  input.value = "";
  fileInput.value = "";
};

startBtn.onclick = () => {
  studyStartTime = Date.now();
};

stopBtn.onclick = () => {
  if (!studyStartTime) return;
  const timeSpent = Math.floor((Date.now() - studyStartTime) / 1000);
  db.ref("studyTime/" + username).get().then((snap) => {
    const total = (snap.val() || 0) + timeSpent;
    db.ref("studyTime/" + username).set(total);
    updateLeaderboard();
  });
  studyStartTime = null;
};

function updateLeaderboard() {
  db.ref("studyTime").once("value", (snap) => {
    leaderboard.innerHTML = "";
    const data = snap.val() || {};
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([name, time]) => {
      const li = document.createElement("li");
      li.textContent = `${name}: ${formatTime(time)}`;
      leaderboard.appendChild(li);
    });
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

loadMessages();
updateLeaderboard();
