// ================= SERVICE WORKER =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js')
      .then(function () { console.log('SW Registered'); })
      .catch(function (err) { console.log('SW Failed:', err); });
  });
}

// ================= GLOBAL VARIABLES =================
let rewardPoints = parseInt(localStorage.getItem("rewards")) || 0;
let vInterval = null;
let alreadyTriggered = false;

// ================= AUTOMATIC VIBRATION CHECKER =================
setInterval(function () {
  if (alreadyTriggered) return;

  const meds = JSON.parse(localStorage.getItem("medicines")) || [];
  const now = new Date();

  const currentTime =
    String(now.getHours()).padStart(2, '0') + ":" +
    String(now.getMinutes()).padStart(2, '0');

  let triggered = false;

  const updatedMeds = meds.map(function (m) {
    if (m.time === currentTime && !m.isHandled) {
      triggered = true;
      m.isHandled = true;
    }
    return m;
  });

  if (triggered) {
    alreadyTriggered = true;

    localStorage.setItem("medicines", JSON.stringify(updatedMeds));

    if ("vibrate" in navigator) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }

    window.location.href = "vibration.html";
  }
}, 10000);

// ================= UI =================
function updatePointsDisplay() {
  const display = document.getElementById("pointDisplay");
  if (display) {
    display.innerText = "🌟 " + rewardPoints;
    localStorage.setItem("rewards", rewardPoints);
  }
}

// ================= VIBRATION =================
function startVibration() {
  if ("vibrate" in navigator) {
    clearInterval(vInterval);
    vInterval = setInterval(function () {
      navigator.vibrate([1000, 500, 1000, 500, 2000]);
    }, 5000);
    navigator.vibrate([1000, 500, 1000]);
  }
}

function stopVibration() {
  clearInterval(vInterval);
  if ("vibrate" in navigator) navigator.vibrate(0);
}

// ================= MED ACTION =================
function handleMedAction(checkbox, medName) {
  let meds = JSON.parse(localStorage.getItem("medicines")) || [];

  if (checkbox.checked) {
    rewardPoints += 10;
    updatePointsDisplay();

    stopVibration();
    addHistory("Taken: " + medName);

    meds = meds.map(function (m) {
      if (m.name === medName) m.isHandled = true;
      return m;
    });

    checkbox.parentElement.style.opacity = "0.5";
    checkbox.disabled = true;

  } else {
    rewardPoints = Math.max(0, rewardPoints - 15);
    updatePointsDisplay();

    startVibration();
    addHistory("🚨 MISSED: " + medName + " (-15 Points)");
  }

  localStorage.setItem("medicines", JSON.stringify(meds));
}

// ================= SAFE INIT =================
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (typeof loadTheme === "function") loadTheme();
    if (typeof applyLanguage === "function") applyLanguage();
  } catch (e) {}

  loadHistory();
  loadSavedContact();
  displayMedicines();
  updatePointsDisplay();

  console.log("App Loaded ✅");
});

// ================= NOTIFICATION =================
if ("Notification" in window) {
  Notification.requestPermission();
}

// ================= LOGIN =================
function register() {
  let uEl = document.getElementById("username");
  let pEl = document.getElementById("password");

  let u = uEl ? uEl.value.trim() : "";
  let p = pEl ? pEl.value.trim() : "";

  if (!u || !p) return alert("Fill all fields");

  if (localStorage.getItem("user_" + u)) {
    return alert("User already exists!");
  }

  localStorage.setItem("user_" + u, p);
  alert("Registered successfully ✅");
}

function login() {
  let uEl = document.getElementById("username");
  let pEl = document.getElementById("password");

  let u = uEl ? uEl.value.trim() : "";
  let p = pEl ? pEl.value.trim() : "";

  let stored = localStorage.getItem("user_" + u);

  if (!stored) return alert("User not found ❌");

  if (stored === p) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", u);
    window.location.href = "dashboard.html";
  } else {
    alert("Wrong password ❌");
  }
}

// ================= NAVIGATION =================
function goBack() { history.back(); }
function openAdd() { window.location.href = "add.html"; }
function openHistory() { window.location.href = "history.html"; }
function openDoctor() { window.location.href = "doctor.html"; }
function openContacts() { window.location.href = "contacts.html"; }
function openSettings() { window.location.href = "settings.html"; }
function openVibration() { window.location.href = "vibration.html"; }

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// ================= DARK MODE =================
function toggleDark() {
  let isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", !isDark);
}

// ================= LANGUAGE =================
const translations = {
  en: { title: "💙 MEDIMATE", noHistory: "No history available" },
  hi: { title: "💙 मेडिमेट", noHistory: "कोई इतिहास उपलब्ध नहीं" },
  bn: { title: "💙 মেডিমেট", noHistory: "কোনো ইতিহাস নেই" }
};

function applyLanguage() {
  let lang = localStorage.getItem("lang") || "en";
  let t = translations[lang];

  document.querySelectorAll("[data-lang]").forEach(function (el) {
    let key = el.getAttribute("data-lang");
    if (t[key]) el.innerText = t[key];
  });
}

function changeLanguage() {
  let select = document.getElementById("languageSelect");
  if (!select) return;

  localStorage.setItem("lang", select.value);
  applyLanguage();
}

// ================= MEDICINES =================
function addMedicine() {
  let nameEl = document.getElementById("medName");
  let doseEl = document.getElementById("medDose");
  let timeEl = document.getElementById("medTime");

  let name = nameEl ? nameEl.value.trim() : "";
  let dose = doseEl ? doseEl.value.trim() : "";
  let time = timeEl ? timeEl.value : "";

  if (!name || !dose || !time) return alert("Fill all fields");

  let meds = JSON.parse(localStorage.getItem("medicines")) || [];
  meds.push({ name: name, dose: dose, time: time, isHandled: false });

  localStorage.setItem("medicines", JSON.stringify(meds));

  addHistory("Added: " + name);

  window.location.href = "dashboard.html";
}

// ================= DISPLAY MEDS (FIXED SAFE) =================
function displayMedicines() {
  const container = document.getElementById("medicineListDisplay");
  if (!container) return;

  const meds = JSON.parse(localStorage.getItem("medicines")) || [];

  if (meds.length === 0) {
    container.innerHTML = "<p>No medicines added today.</p>";
    return;
  }

  container.innerHTML = "";

  meds.forEach(function (m) {
    let div = document.createElement("div");
    div.style = "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:15px;background:rgba(255,255,255,0.1);border-radius:12px;";

    if (m.isHandled) div.style.opacity = "0.5";

    let info = document.createElement("div");
    info.innerHTML = "<strong>" + m.name + "</strong> (" + m.dose + ")<br><small>⏰ " + m.time + "</small>";

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style = "width:25px;height:25px;";
    checkbox.checked = m.isHandled;

    if (m.isHandled) checkbox.disabled = true;

    checkbox.addEventListener("change", function () {
      handleMedAction(this, m.name);
    });

    div.appendChild(info);
    div.appendChild(checkbox);
    container.appendChild(div);
  });
}

// ================= HISTORY =================
function addHistory(title) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.unshift({
    title: title || "Record",
    time: new Date().toLocaleString()
  });

  localStorage.setItem("history", JSON.stringify(history.slice(0, 20)));
}

function loadHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let list = document.getElementById("historyList");

  if (!list) return;

  list.innerHTML = history.map(function (h) {
    return "<div style='margin-bottom:10px;padding:10px;background:#1e293b;border-radius:10px;'>" +
      "<b>" + h.title + "</b><br><small>🕒 " + h.time + "</small></div>";
  }).join("") || "No history found";
}

// ================= CONTACT =================
function saveContact() {
  let nameEl = document.getElementById("contactName");
  let phoneEl = document.getElementById("contactPhone");

  let name = nameEl ? nameEl.value.trim() : "";
  let phone = phoneEl ? phoneEl.value.trim() : "";

  if (!name || !phone) return alert("⚠️ Fill all fields");

  localStorage.setItem("contactName", name);
  localStorage.setItem("contactPhone", phone);

  alert("✅ Contact saved!");
  loadSavedContact();
}

function loadSavedContact() {
  let name = localStorage.getItem("contactName");
  let phone = localStorage.getItem("contactPhone");
  let display = document.getElementById("savedContact");

  if (name && phone && display) {
    display.innerText = "Saved: " + name + " (" + phone + ")";
  }
}

// ================= SOS =================
function openSOS() {
  let phone = localStorage.getItem("contactPhone");

  if (!phone) {
    alert("⚠️ No emergency contact found!");
    return;
  }

  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

  const message = encodeURIComponent("🚨 Emergency! Please check on me (MediMate)");
  window.location.href = "https://wa.me/" + cleanPhone + "?text=" + message;
}