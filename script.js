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

let currentUser = { name: "", pic: "" };
let currentChannel = "general";

// Set User
function setUser() {
    const nameInput = document.getElementById('username').value.trim();
    const picInput = document.getElementById('profile-pic').files[0];

    if (!nameInput) return alert("Enter a name");

    if (picInput) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.name = nameInput;
            currentUser.pic = e.target.result;
            alert("User set successfully!");
        };
        reader.readAsDataURL(picInput);
    } else {
        currentUser.name = nameInput;
        currentUser.pic = ""; // default or blank
        alert("User set successfully!");
    }
}

// Switch Channels
function switchChannel(channel) {
    currentChannel = channel;
    document.getElementById('chat-box').innerHTML = "";
    listenToMessages();
}

// Send Message
function sendMessage() {
    const text = document.getElementById('message').value.trim();
    if (!text || !currentUser.name) return alert("Set your name and type something!");

    const msg = {
        name: currentUser.name,
        pic: currentUser.pic,
        text: text,
        time: Date.now()
    };

    db.ref("channels/" + currentChannel).push(msg);
    document.getElementById('message').value = "";
}

// Listen for Messages
function listenToMessages() {
    db.ref("channels/" + currentChannel).on("value", (snapshot) => {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = "";
        snapshot.forEach(child => {
            const msg = child.val();
            const div = document.createElement("div");
            div.className = "message";
            div.innerHTML = `
        <img src="${msg.pic || 'https://via.placeholder.com/40'}">
        <strong>${msg.name}</strong>: ${msg.text}
      `;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Study Timer
let startTime = null;

function startStudy() {
    startTime = Date.now();
    alert("Study started!");
}

function endStudy() {
    if (!startTime) return alert("Start study first!");
    const minutes = Math.floor((Date.now() - startTime) / 60000);
    alert(`You studied for ${minutes} minutes.`);
    startTime = null;
}

// Start with default channel
listenToMessages();