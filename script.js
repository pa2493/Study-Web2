// Your Firebase Config
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

let username = "Anonymous";
let profilePicData = "";
let currentChannel = "general";
let studyStartTime = null;

function setUser() {
  const nameInput = document.getElementById("username").value.trim();
  const picInput = document.getElementById("profilePic").files[0];

  if (nameInput) {
    username = nameInput;
  }

  if (picInput) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePicData = e.target.result;
    };
    reader.readAsDataURL(picInput);
  }

  alert("User set!");
}

function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  const file = document.getElementById("fileInput").files[0];
  const messageData = {
    user: username,
    profilePic: profilePicData,
    text: msg,
    timestamp: Date.now()
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      messageData.file = e.target.result;
      db.ref(`channels/${currentChannel}`).push(messageData);
    };
    reader.readAsDataURL(file);
  } else {
    db.ref(`channels/${currentChannel}`).push(messageData);
  }

  document.getElementById("messageInput").value = "";
  document.getElementById("fileInput").value = "";
}

function renderMessage(data) {
  const box = document.getElementById("chatBox");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message");

  const img = data.profilePic ? `<img src="${data.profilePic}" width="30"/>` : "";
  const file = data.file ? `<img src="${data.file}" />` : "";

  msgDiv.innerHTML = `${img} <strong>${data.user}:</strong> ${data.text} ${file}`;
  box.appendChild(msgDiv);
  box.scrollTop = box.scrollHeight;
}

function switchChannel(channelName) {
  currentChannel = channelName;
  document.getElementById("chatBox").innerHTML = "";
  listenToChannel();
}

function listenToChannel() {
  db.ref(`channels/${currentChannel}`).off(); // Remove old listener
  db.ref(`channels/${currentChannel}`).on("child_added", (snapshot) => {
    renderMessage(snapshot.val());
  });
}

function startStudy() {
  studyStartTime = Date.now();
}

function endStudy() {
  if (studyStartTime) {
    const duration = Math.floor((Date.now() - studyStartTime) / 60000); // in minutes
    updateRank(duration);
  }
}

function updateRank(minutes) {
  let rank = "Newbie";
  if (minutes > 30) rank = "Learner";
  if (minutes > 90) rank = "Scholar";
  if (minutes > 180) rank = "Mastermind";

  document.getElementById("rank").innerText = rank;
}

// Start listening to the default channel
listenToChannel();
