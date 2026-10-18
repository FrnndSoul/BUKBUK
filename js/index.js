// ===============================
// Dashboard Buttons
// ===============================
document.getElementById('requestBtn').addEventListener('click', () => {
  window.location.href = 'pages/request.html';
});

document.getElementById('statusBtn').addEventListener('click', () => {
  window.location.href = 'pages/status.html';
});

// ===============================
// Accessibility Menu Toggle
// ===============================
const accessibilityBtn = document.getElementById('accessibilityBtn');
const accessibilityMenu = document.getElementById('accessibilityMenu');

accessibilityBtn.addEventListener('click', () => {
  accessibilityMenu.classList.toggle('show');
});

// ===============================
// Language Translations
// ===============================
const translations = {
  en: {
    title: "Barangay Ugong Kiosk Request",
    subtitle: "Welcome — choose an option to continue",
    request: "Request",
    status: "Status",
    noteRequest: "Request — start a new kiosk request (IDs or forms may be required).",
    noteStatus: "Status — check your request progress using your tracking code.",
    welcome: "Touch the screen to get started!"
  },
  tl: {
    title: "Barangay Ugong Kiosk Request",
    subtitle: "Maligayang pagdating — pumili upang magpatuloy",
    request: "Kahilingan",
    status: "Kalagayan",
    noteRequest: "Kahilingan — magsimula ng bagong kahilingan (maaaring kailangan ng ID o form).",
    noteStatus: "Kalagayan — tingnan ang progreso gamit ang tracking code.",
    welcome: "Pindutin ang screen upang magsimula!"
  }
};

// ===============================
// Language Button Logic
// ===============================
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

function setLanguage(lang) {
  localStorage.setItem("kioskLanguage", lang);

  document.querySelector('main h1').textContent = translations[lang].title;
  document.querySelector('.subtitle').textContent = translations[lang].subtitle;
  document.getElementById('requestBtn').textContent = translations[lang].request;
  document.getElementById('statusBtn').textContent = translations[lang].status;

  const notes = document.querySelectorAll('.note');
  notes[0].textContent = translations[lang].noteRequest;
  notes[1].textContent = translations[lang].noteStatus;

  document.querySelector('.welcome-text').textContent =
    translations[lang].welcome;

  // Close accessibility menu after selection
  accessibilityMenu.classList.remove('show');
}

// ==================================================
// ✅ ADD STEP 2: Read saved language
// ==================================================
const savedLang = localStorage.getItem("kioskLanguage");

// ==================================================
// ✅ ADD STEP 3: Apply language on page load
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  if (savedLang && typeof setLanguage === "function") {
    setLanguage(savedLang);
  }
});

// ===============================
// Idle Screen Logic
// ===============================
let idleTimer;
const idleTime = 10000; // 10 seconds
const idleScreen = document.getElementById('idleScreen');

function showIdleScreen() {
  idleScreen.style.display = 'flex';
}

function hideIdleScreen() {
  idleScreen.style.display = 'none';
  resetIdleTimer();
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(showIdleScreen, idleTime);
}

// Reset idle on any interaction
['mousemove', 'mousedown', 'touchstart', 'keypress'].forEach(evt => {
  document.addEventListener(evt, hideIdleScreen, false);
});

// Start idle timer
resetIdleTimer();
