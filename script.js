if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('✅ HealthGuardian SW Registered!'))
      .catch(err => console.error('❌ SW Registration Failed:', err));
  });
}

// ================= GLOBAL VARIABLES =================
let rewardPoints = parseInt(localStorage.getItem("rewards")) || 0;
let vInterval = null;

// ================= AUTOMATIC VIBRATION CHECKER =================
setInterval(() => {
  const meds = JSON.parse(localStorage.getItem("medicines")) || [];
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                      now.getMinutes().toString().padStart(2, '0');

  let triggered = false;

  const updatedMeds = meds.map(m => {
    if (m.time === currentTime && !m.isHandled) {
      triggered = true;
      return { ...m, isHandled: true }; 
    }
    return m;
  });

  if (triggered) {
    localStorage.setItem("medicines", JSON.stringify(updatedMeds));
    if ("vibrate" in navigator) navigator.vibrate([500, 200, 500]);
    window.location.href = "vibration.html"; 
  }
}, 30000);

// ================= LANGUAGE DICTIONARY =================
const translations = {
  en: { 
    title: "💙 MEDIMATE", 
    login: "Login",
    register: "Register",
    addMed: "Add Medicine",
    sos: "SOS",
    save: "Save",
    back: "Back",
    points: "Points",
    history: "History",
    settings: "Settings"
  },
  hi: { 
    title: "💙 मेडिमेट", 
    login: "लॉगिन",
    register: "रजिस्टर",
    addMed: "दवा जोड़ें",
    sos: "आपातकालीन",
    save: "सहेजें",
    back: "पीछे",
    points: "अंक",
    history: "इतिहास",
    settings: "सेटिंग्स"
  },
  bn: { 
    title: "💙 মেডিমেট", 
    login: "লগইন",
    register: "নিবন্ধন",
    addMed: "ওষুধ যোগ করুন",
    sos: "জরুরী",
    save: "সেভ করুন",
    back: "ফিরে যান",
    points: "পয়েন্ট",
    history: "ইতিহাস",
    settings: "সেটিংস"
  }
};

function applyLanguage() {
  let lang = localStorage.getItem("lang") || "en";
  let t = translations[lang];
  document.querySelectorAll("[data-lang]").forEach(el => {
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

// ================= LOGIN & REGISTRATION =================
function register() {
  let u = document.getElementById("username")?.value.trim();
  let p = document.getElementById("password")?.value.trim();
  if (!u || !p) return alert("Fill all fields");
  localStorage.setItem("user_" + u, p);
  alert("Registered successfully ✅");
}

function login() {
  let u = document.getElementById("username")?.value.trim();
  let p = document.getElementById("password")?.value.trim();
  let stored = localStorage.getItem("user_" + u);

  if (!u || !p) return alert("Fill all fields");
  if (stored === p) {
    localStorage.setItem("loggedIn", "true");
    alert("Login successful ✅");
    window.location.href = "dashboard.html"; 
  } else {
    alert("Wrong password ❌");
  }
}

// ================= CONTACT & SOS (FIXED) =================
function saveContact() {
  // These IDs must match your HTML input IDs exactly
  const name = document.querySelector('input[type="text"]').value; 
  const phone = document.querySelector('input[type="tel"]')?.value || document.querySelectorAll('input[type="text"]')[1]?.value;

  if (!name || !phone) {
    return alert("Fill all fields");
  }

  localStorage.setItem("contactName", name);
  localStorage.setItem("contactPhone", phone);
  alert("Contact Saved! ✅");
  loadSavedContact();
}

function loadSavedContact() {
  let name = localStorage.getItem("contactName");
  let phone = localStorage.getItem("contactPhone");
  let display = document.getElementById("savedContact");
  if (name && phone && display) {
    display.innerText = `Saved: ${name} (${phone})`;
  }
}

function openSOS() {
  let phone = localStorage.getItem("contactPhone");
  window.location.href = "vibration.html"; 
  if (phone) {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
    const message = "🚨 Emergency! Please check on me (MediMate)";
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }
}

// ================= MEDICINES =================
function addMedicine() {
  const name = document.getElementById("medName").value;
  const dose = document.getElementById("medDose").value;
  const time = document.getElementById("medTime").value;
  if (!name || !dose || !time) return alert("Fill all fields");
  let meds = JSON.parse(localStorage.getItem("medicines")) || [];
  meds.push({ name, dose, time, isHandled: false });
  localStorage.setItem("medicines", JSON.stringify(meds));
  window.location.href = "dashboard.html";
}

// ================= NAVIGATION =================
function goBack() { history.back(); }
function openAdd() { window.location.href = "add.html"; }
function openContacts() { window.location.href = "contacts.html"; }

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();
  loadSavedContact();
  // Call this if on the dashboard page
  if(document.getElementById("medicineListDisplay")) {
      // Logic to display meds...
  }
});