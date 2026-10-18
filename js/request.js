console.log("✅ request.js loaded");


// ✅ ADD THIS (language read) — very top of file
const kioskLang = localStorage.getItem("kioskLanguage") || "en";

document.addEventListener("DOMContentLoaded", function () {

  // ✅ ADD THIS (apply language on load)
  if (typeof kioskTranslations !== "undefined") {
    applyRequestLanguage(kioskLang);
  }

  const idModalEl = document.getElementById("idPromptModal");
  const idModal = new bootstrap.Modal(idModalEl);
  // autofill.js

  // Show modal immediately on page load
  idModal.show();

  document.getElementById("idYesBtn").addEventListener("click", () => {
    sessionStorage.setItem("hasValidId", "yes");
    idModal.hide();
  });

  document.getElementById("idNoBtn").addEventListener("click", () => {
    sessionStorage.setItem("hasValidId", "no");
    idModal.hide();
  });

  const select = document.getElementById("requestTypeSelect");
  const formContainer = document.getElementById("formContainer");

  if (!select) {
    console.error("❌ Select not found");
    return;
  }

  fetch("../api/request_types.php")
    .then(response => response.json())
    .then(data => {
      console.log("✅ Loaded request types:", data);

      select.innerHTML = '<option value="">-- Select Request Type --</option>';

      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error("❌ Failed to load request types", error);
    });

  select.addEventListener("change", () => {
    const requestTypeId = select.value;

    if (!requestTypeId) {
      formContainer.innerHTML = "";
      formContainer.style.display = "none";
      return;
    }

    formContainer.style.display = "block";

    fetch(`../api/get_request_fields.php?request_type_id=${requestTypeId}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 Request data:", data);

        if (!data.request_sections?.length) {
          console.error("❌ No request_sections");
          return;
        }

        const templateKey = SECTION_TO_TEMPLATE[data.request_sections[0]];

        formContainer.innerHTML = `
          <form id="activeForm" novalidate>
            ${FORM_TEMPLATES[templateKey]()}
            <button type="submit" class="btn btn-primary w-100 mt-3">
              Submit Request
            </button>
          </form>
        `;

        initFormBehaviors();
        initializeDatePickers();

      })
      .catch(err => console.error("❌ Fetch error:", err));
  });

});


/* =========================================================
   FORM TEMPLATES
========================================================= */
const SECTION_TO_TEMPLATE = {
  basic: "basic",
  construction: "construction",
  complaints: "complaint"
};

const FORM_TEMPLATES = {
  /* ===============================
     BASIC DETAILS TEMPLATE
  =============================== */
  basic() {
    return `
      <div class="mb-3">
        <label class="form-label">Full Name</label>
        <input type="text" name="full_name" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Contact Number</label>
        <input type="tel" name="contact_number" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input type="email" name="email" class="form-control">
      </div>

      <div class="mb-3">
        <label class="form-label">Address</label>
        <input type="text" name="address" class="form-control" required>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Birthdate</label>
          <input type="date" id="bday" name="birthdate" class="form-control" required>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Age</label>
          <input id="age" type="number" name="age" class="form-control" readonly>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Civil Status</label>
        <select name="civil_status" class="form-select" required>
          <option value="">-- Select --</option>
          <option>Single</option>
          <option>Married</option>
          <option>Widowed</option>
          <option>Separated</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Length of Stay in Brgy. Ugong</label>
        <input type="text" name="length_of_stay" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label d-block">Sex</label>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="sex" value="Male" required>
          <label class="form-check-label">Male</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="sex" value="Female">
          <label class="form-check-label">Female</label>
        </div>
      </div>
    `;
  },

  /* ===============================
     CONSTRUCTION TEMPLATE
  =============================== */
  construction() {
    return `
      <div class="mb-3">
        <label class="form-label">Name of Owner</label>
        <input type="text" name="owner_name" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Position</label>
        <input type="text" name="position" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Type of Construction</label>

        <div class="form-check">
          <input class="form-check-input" type="radio" name="construction_type" value="New" required>
          <label class="form-check-label">New</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="radio" name="construction_type" value="Renovation">
          <label class="form-check-label">Renovation</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="radio" name="construction_type" value="Demolition">
          <label class="form-check-label">Demolition</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="radio" name="construction_type" value="Excavation">
          <label class="form-check-label">Excavation</label>
        </div>

        <div class="form-check mt-2">
          <input class="form-check-input" type="radio" name="construction_type" value="Others">
          <label class="form-check-label">Others</label>
        </div>

        <input type="text"
               name="construction_other"
               class="form-control mt-2"
               placeholder="Please specify (if Others)">
      </div>
    `;
  },

  /* ===============================
     COMPLAINT TEMPLATE
  =============================== */
  complaint() {
    return `
      <div class="mb-3">
        <label class="form-label">Respondent Name</label>
        <input type="text" name="respondent_name" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Respondent Address</label>
        <input type="text" name="respondent_address" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Type of Complaint</label>
        <input type="text" name="complaint_type" class="form-control" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Complaint Body</label>
        <textarea name="complaint_body"
                  class="form-control"
                  rows="4"
                  required></textarea>
      </div>
    `;
  }
};




// ✅ ADD THIS (language application) — bottom of file
function applyRequestLanguage(lang) {
  const t = kioskTranslations[lang];
  if (!t) return;

  document.querySelector("h5.fw-bold").textContent = t.requestTypes;
  document.getElementById("requestTypeSelect").options[0].textContent = t.selectRequest;
  document.getElementById("backBtn").textContent = t.back;

  document.querySelector("#confirmModal .modal-title").textContent = t.confirmTitle;
  document.querySelector("#confirmModal .modal-body").textContent = t.confirmText;
  document.getElementById("confirmYes").textContent = t.yes;
  document.getElementById("confirmNo").textContent = t.no;

  document.querySelector("#summaryModal .modal-title").textContent = t.submissionSummary;
  document.getElementById("printReceiptBtn").textContent = t.print;

  document.querySelector("#idPromptModal .modal-title").textContent = t.beforeContinue;
  document.querySelector("#idPromptModal p").textContent = t.haveId;
  document.getElementById("idYesBtn").textContent = t.yes;
  document.getElementById("idNoBtn").textContent = t.no;

  document.querySelector("#cameraModal .modal-title").textContent = t.scanId;
  document.querySelector("#cameraModal .btn-secondary").textContent = t.cancel;
}
