// Initialize Firebase (Replace with your Firebase config)
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

let username = localStorage.getItem('username') || '';

const setNameBtn = document.getElementById("setNameBtn");
const nameInput = document.getElementById("nameInput");
const setNameArea = document.getElementById("setNameArea");
const chatSection = document.getElementById("chatSection");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const channelSelect = document.getElementById("channelSelect");

let currentChannel = "general";
let studyTime = 0;
let timerInterval = null;

// Automatically hide set name area if already set
if (username) {
    setNameArea.style.display = "none";
    chatSection.style.display = "block";
    startStudyTimer();
}

setNameBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name !== "") {
        username = name;
        localStorage.setItem("username", username);
        setNameArea.style.display = "none";
        chatSection.style.display = "block";
        startStudyTimer();
    }
});

channelSelect.addEventListener("change", () => {
    currentChannel = channelSelect.value;
    loadMessages();
});

sendBtn.addEventListener("click", () => {
    const msg = messageInput.value.trim();
    if (msg === "") return;

    const newMsgRef = db.ref("channels/" + currentChannel).push();
    newMsgRef.set({
        user: username,
        message: msg,
        timestamp: Date.now()
    });

    messageInput.value = "";
});

function loadMessages() {
    messagesDiv.innerHTML = "";
    db.ref("channels/" + currentChannel).on("value", snapshot => {
        messagesDiv.innerHTML = "";
        snapshot.forEach(child => {
            const data = child.val();
            const msgElement = document.createElement("div");
            msgElement.innerHTML = `<strong>${data.user}:</strong> ${highlightMentions(data.message)}`;
            messagesDiv.appendChild(msgElement);
        });
    });
}

function highlightMentions(message) {
    if (!username) return message;
    return message.replaceAll(`@${username}`, `<span style="color:#4fc3f7; font-weight:bold;">@${username}</span>`);
}

function startStudyTimer() {
    const startTime = Date.now();
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        studyTime = Math.floor((currentTime - startTime) / 1000);
        updateRank(studyTime);
    }, 1000);
}

function updateRank(time) {
    const ranks = [
        { name: "Newbie", time: 0 },
        { name: "Learner", time: 600 },
        { name: "Scholar", time: 1800 },
        { name: "Mastermind", time: 3600 },
        { name: "Study Legend", time: 7200 }
    ];

    const rank = ranks.slice().reverse().find(r => time >= r.time);
    document.getElementById("rank").textContent = `Rank: ${rank.name}`;
}

// Theme toggle (Dark/Light)
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}
