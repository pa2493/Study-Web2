
// Firebase configuration (Replace with your actual config)
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

// Global
let username = localStorage.getItem('username');
let currentChannel = 'general';
let startTime = null;

// DOM elements
const setNameBtn = document.getElementById("setNameBtn");
const nameInput = document.getElementById("nameInput");
const nameBox = document.getElementById("nameBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesBox = document.getElementById("messages");
const channelBtns = document.querySelectorAll(".channel-btn");
const startStudyBtn = document.getElementById("startStudyBtn");
const endStudyBtn = document.getElementById("endStudyBtn");
const leaderboardBox = document.getElementById("leaderboard");
const darkModeToggle = document.getElementById("darkModeToggle");

// Name setup
if (username) {
  nameBox.style.display = "none";
} else {
  nameBox.style.display = "block";
}

setNameBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) {
    localStorage.setItem("username", name);
    username = name;
    nameBox.style.display = "none";
    loadMessages();
    loadLeaderboard();
  }
});

// Send message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text || !username) return;

  const msg = {
    user: username,
    text: text,
    time: Date.now()
  };

  db.ref(`${currentChannel}/messages`).push(msg);
  messageInput.value = "";
});

// Load messages
function loadMessages() {
  db.ref(`${currentChannel}/messages`).off();
  messagesBox.innerHTML = "";

  db.ref(`${currentChannel}/messages`).on("child_added", (snap) => {
    const msg = snap.val();
    const msgDiv = document.createElement("div");
    msgDiv.className = "message";

    // Ping highlight
    let msgText = msg.text;
    if (msg.text.includes(`@${username}`)) {
      msgText = `<span class="ping">@${username}</span>` + msg.text.replace(`@${username}`, '');
    }

    msgDiv.innerHTML = `
      <strong>${msg.user}</strong>: ${msgText}
      <small>${new Date(msg.time).toLocaleTimeString()}</small>
    `;

    // Delete button
    if (msg.user === username) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => {
        db.ref(`${currentChannel}/messages/${snap.key}`).remove();
      };
      msgDiv.appendChild(delBtn);
    }

    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });

  // On delete
  db.ref(`${currentChannel}/messages`).on("child_removed", (snap) => {
    loadMessages();
  });
}

// Switch channels
channelBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentChannel = btn.dataset.channel;
    loadMessages();
  });
});

// Study Timer
startStudyBtn.addEventListener("click", () => {
  startTime = Date.now();
  alert("Study timer started!");
});

endStudyBtn.addEventListener("click", () => {
  if (!startTime) return alert("Start timer first!");
  const endTime = Date.now();
  const minutes = Math.floor((endTime - startTime) / 60000);

  const studyRef = db.ref(`study/${username}`);
  studyRef.once("value").then((snap) => {
    const oldTime = snap.val() || 0;
    studyRef.set(oldTime + minutes);
    alert(`Study session saved: ${minutes} minutes`);
    loadLeaderboard();
  });

  startTime = null;
});

// Leaderboard
function loadLeaderboard() {
  leaderboardBox.innerHTML = "";
  db.ref("study").once("value", (snap) => {
    const data = [];
    snap.forEach((child) => {
      data.push({ user: child.key, minutes: child.val() });
    });

    data.sort((a, b) => b.minutes - a.minutes);
    data.forEach((entry, i) => {
      const li = document.createElement("li");
      li.textContent = `#${i + 1} ${entry.user} - ${entry.minutes} min`;
      leaderboardBox.appendChild(li);
    });
  });
}

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "Dark" : "Light";
  darkModeToggle.textContent = `${mode} Mode`;
});

// Init
if (username) {
  loadMessages();
  loadLeaderboard();
}
