console.log("✅ script.js loaded");

// ---------- Utils ----------
let requestTypeSelect;
let formContainer;

let currentInput = null;

let _bdayChangeHandler = null;
let _ageInputHandler = null;

// --- Helper utilities (kept from your original) ---
let currentRef = null;

// function randRef() {
//   if (currentRef) return currentRef;

//   const array = new Uint32Array(1);
//   crypto.getRandomValues(array);
//   currentRef = array[0].toString(16).padStart(8, '0').toUpperCase();
//   return currentRef;
// }
function toUpperHandler(e) {
  // transform caret-safe uppercase
  const start = e.target.selectionStart, end = e.target.selectionEnd;
  e.target.value = e.target.value.toUpperCase();
  try { e.target.setSelectionRange(start, end); } catch { }
}

// mark invalid UI
function markInvalid(el) { el.classList.add('is-required-invalid'); }
function unmarkInvalid(el) { el.classList.remove('is-required-invalid'); }

function focusFirstInvalid(invalidElements) {
  if (!invalidElements || invalidElements.length === 0) return;
  const first = invalidElements[0];
  first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try { first.focus({ preventScroll: true }); } catch { first.focus(); }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the date picker after the DOM is ready
  initializeDatePickers();
});

function initializeDatePickers() {
  flatpickr("input[type='date']", {
    dateFormat: "m/d/Y",
    maxDate: "today",
    disableMobile: true,

    onChange: function (selectedDates, dateStr, instance) {
      const input = instance.input;

      // ✅ Only react if this is the birthday field
      if (input.id !== "bday") return;

      const ageInput = document.getElementById("age");
      if (!ageInput || !selectedDates.length) return;

      const birthDate = selectedDates[0];
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      ageInput.value = age;
    }
  });
}


// Function to display a list of years
function showYearDropdown(instance, yearElement) {
  const calendar = instance.calendarContainer;
  const yearList = document.createElement('div');
  yearList.classList.add('year-list');

  // Get the current year and ensure we calculate a range around it
  const currentYear = new Date().getFullYear();

  // Add the year items to the dropdown
  for (let i = currentYear - 120; i <= currentYear + 5; i++) {
    const yearItem = document.createElement('div');
    yearItem.classList.add('year-item');
    yearItem.textContent = i;

    // Highlight the current year
    if (i === currentYear) {
      yearItem.classList.add('current-year');  // Add a class to highlight the current year
    }

    // Add click event to set the selected year
    yearItem.addEventListener('click', function () {
      // Set the new date with the selected year, maintaining the current month and day
      const selectedDate = instance.selectedDates[0] || new Date(); // Get the current selected date or use the current date
      const selectedMonth = selectedDate.getMonth(); // Preserve the current month (0-based)
      const selectedDay = selectedDate.getDate(); // Preserve the current day

      // Create a new Date object with the selected year and the current month and day
      const newDate = new Date(i, selectedMonth, selectedDay); // Create a new date with the selected year

      // Update the selected year and close the dropdown
      instance.setDate(newDate, true); // Set the new date while maintaining the current month and day
      yearList.style.display = 'none'; // Hide the year list after selection

      // Reapply the `current-year` style to the selected year
      updateCurrentYearHighlight(yearList, i);
    });

    yearList.appendChild(yearItem);
  }

  // Position the year dropdown just below the year element
  yearList.style.position = 'absolute';
  yearList.style.top = `${yearElement.offsetTop + yearElement.offsetHeight}px`;
  yearList.style.left = `${yearElement.offsetLeft}px`;
  yearList.style.width = `${yearElement.offsetWidth}px`;
  calendar.appendChild(yearList);

  // Close the dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!yearList.contains(event.target) && event.target !== yearElement) {
      yearList.style.display = 'none';
    }
  });

  yearList.style.display = 'block'; // Show the year dropdown

  // Reapply the current-year class to the selected year after clicking
  updateCurrentYearHighlight(yearList, currentYear);
}

// Update current-year highlight when a year is selected
function updateCurrentYearHighlight(yearList, currentYear) {
  const yearItems = yearList.querySelectorAll('.year-item');
  yearItems.forEach(item => {
    if (item.textContent == currentYear) {
      item.classList.add('current-year'); // Ensure the current year is highlighted
    } else {
      item.classList.remove('current-year'); // Remove highlight from other years
    }
  });
}



// ---------- Templates ----------

function template_FORM1_COMMON(purposeLabel = 'PURPOSE') {
  // shared among various Form 1 variants
  return `
        <div class="mb-3">
          <label class="form-label" for="purpose">${purposeLabel}</label>
          <input id="purpose" name="purpose" type="text" class="form-control" autocomplete="off"required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="fullName">FULL NAME</label>
          <input id="fullName" name="fullName" type="text" class="form-control uppercase-required" placeholder="" autocomplete="off" required>
        </div>
        <div class="mb-3">
          <label class="form-label" for="address">ADDRESS</label>
          <input id="address" name="address" type="text" class="form-control uppercase-required" placeholder="" autocomplete="off" required>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="date">DATE</label>
            <input id="date" name="date" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="age">AGE</label>
            <input id="age" name="age" type="text" inputmode="numeric" pattern="[0-9]*" class="form-control" placeholder="age" autocomplete="off" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label" for="civilStatus">CIVIL STATUS</label>
            <select id="civilStatus" name="civilStatus" class="form-select" autocomplete="off" required>
              <option value="">-- choose --</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
              <option>Civil Partnership</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="bday">B-DAY</label>
            <input id="bday" name="bday" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">LENGTH OF STAY IN BRGY UGONG</label>
            <input id="lengthOfStay" name="lengthOfStay" type="text" class="form-control" autocomplete="off" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label d-block">SEX</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexMale" value="Male" autocomplete="off" required>
            <label class="form-check-label" for="sexMale">Male</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="sexFemale" value="Female" autocomplete="off" required>
            <label class="form-check-label" for="sexFemale">Female</label>
          </div>
        </div>

        <h6 class="fw-bold mt-3">FOR REPRESENTATIVE (OPTIONAL)</h6>
        <div class="mb-3">
          <label class="form-label" for="repName">NAME</label>
          <input id="repName" name="repName" type="text" class="form-control uppercase-optional" placeholder="optional" autocomplete="off">
        </div>
        <div class="mb-3">
          <label class="form-label" for="repRel">RELATIONSHIP TO APPLICANT</label>
          <input id="repRel" name="repRel" type="text" class="form-control uppercase-optional" placeholder="optional" autocomplete="off">
        </div>
      `;
}

function formHTML_FORM1(purposeLabelText = 'PURPOSE') {
  return `
        
        <form id="activeForm" novalidate>
          ${template_FORM1_COMMON(purposeLabelText)}
          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill autocomplete="off" required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM2_CONSTRUCTION() {
  return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="date2">DATE</label>
            <input id="date2" name="date" type="date" class="form-control"autocomplete="off" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerName">NAME OF OWNER</label>
            <input id="ownerName" name="ownerName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="ownerAddress">ADDRESS</label>
            <input id="ownerAddress" name="ownerAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="repName2">NAME OF REPRESENTATIVE</label>
              <input id="repName2" name="repName2" type="text" class="form-control uppercase-required" autocomplete="off" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="position">POSITION</label>
              <input id="position" name="position" type="text" class="form-control uppercase-required" autocomplete="off" required>
            </div>
          </div>

          <div class="mb-3">
  <label class="form-label" for="contactNum">CONTACT#</label>
  <div class="input-group">
    <span class="input-group-text">+63</span>
    <input id="contactNum" name="contactNum" type="text" inputmode="numeric" pattern="[0-9]*" class="form-control" placeholder="912 452 1234" autocomplete="off" required autocomplete="off
    " maxlength="12">
  </div>
  <div class="form-text">Enter 10 digits only (mobile format). Spaces will be added automatically.</div>
</div>

          <div class="mb-3">
            <label class="form-label">TYPE OF CONSTRUCTION <small class="text-muted">(select at least one)</small></label>
            <div id="constructionTypes">
              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consNew" name="consType" value="New" autocomplete="off">
                <label class="form-check-label" for="consNew">NEW CONSTRUCTION</label>
                <input id="consNewSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consRen" name="consType" value="Renovation" autocomplete="off">
                <label class="form-check-label" for="consRen">RENOVATION</label>
                <input id="consRenSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consDem" name="consType" autocomplete="off" value="Demolition">
                <label class="form-check-label" for="consDem">DEMOLITION</label>
                <input id="consDemSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consExc" name="consType" autocomplete="off" value="Excavation">
                <label class="form-check-label" for="consExc">EXCAVATION</label>
                <input id="consExcSpec" class="form-control mt-2 cons-spec" placeholder="Please specify (if applicable)" autocomplete="off" disabled>
              </div>

              <div class="form-check mb-2">
                <input class="form-check-input cons-check" type="checkbox" id="consOther" name="consType" autocomplete="off" value="Others">
                <label class="form-check-label" for="consOther">OTHERS</label>
                <input id="consOtherSpec" class="form-control mt-2 cons-spec" placeholder="Please specify" autocomplete="off" disabled>
              </div>
            </div>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM2_FACILITIES() {
  // simpler facility usage form (Form 2 variant)
  return `
      
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="dateF">DATE</label>
            <input id="dateF" name="date" type="date" class="form-control" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="nameOwnerF">NAME OF REQUESTOR</label>
            <input id="nameOwnerF" name="nameOwnerF" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="addressF">ADDRESS</label>
            <input id="addressF" name="addressF" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="facilityType">FACILITY / PROPERTY TO USE</label>
            <input id="facilityType" name="facilityType" type="text" class="form-control" autocomplete="off" required>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_KATAR() {
  return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="complainantName">Complainant Complete Name</label>
            <input id="complainantName" name="complainantName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complainantAddress">Complainant Complete Address</label>
            <input id="complainantAddress" name="complainantAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentName">Respondent Name</label>
            <input id="respondentName" name="respondentName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="respondentAddress">Respondent Complete Address</label>
            <input id="respondentAddress" name="respondentAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintType">Type of Complaint</label>
            <input id="complaintType" name="complaintType" type="text" class="form-control" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="complaintBody">The Complaint Body</label>
            <textarea id="complaintBody" name="complaintBody" rows="4" class="form-control" autocomplete="off" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_FILEACTION() {
  // Certificate to File Action (Form 3)
  return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="ctfaName">Complainant Complete Name</label>
            <input id="ctfaName" name="ctfaName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaAddress">Complainant Address</label>
            <input id="ctfaAddress" name="ctfaAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="ctfaReason">Reason / Details</label>
            <textarea id="ctfaReason" name="ctfaReason" rows="4" class="form-control" autocomplete="off" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}

function formHTML_FORM3_BPO() {
  // Barangay Protection Order
  return `
       
        <form id="activeForm" novalidate>
          <div class="mb-3">
            <label class="form-label" for="bpoName">Requestor Full Name</label>
            <input id="bpoName" name="bpoName" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoAddress">Requestor Address</label>
            <input id="bpoAddress" name="bpoAddress" type="text" class="form-control uppercase-required" autocomplete="off" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bpoDetails">Details / Reason</label>
            <textarea id="bpoDetails" name="bpoDetails" rows="4" class="form-control" autocomplete="off" required></textarea>
          </div>

          <div class="mt-3">
            <div id="formError" class="text-danger mb-2" style="display:none;">Fill required fields with valid data!</div>
            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Request</button>
          </div>
        </form>
      `;
}
// ---------- TEMPLATE REGISTRY ----------
const TEMPLATE_REGISTRY = {
  "certificate": {
    title: "Issuance of Barangay Certificate",
    render: () => formHTML_FORM1("PURPOSE")
  },
  "residency-certificate": {
    title: "Residency Certificate",
    render: () => formHTML_FORM1("PURPOSE")
  },
  "business-permit-endorsement": {
    title: "Business Permit Endorsement",
    render: () => formHTML_FORM1("BUSINESS PURPOSE")
  },
  "construction-clearance": {
    title: "Construction / Work Clearance",
    render: formHTML_FORM2_CONSTRUCTION
  },
  "facility-usage": {
    title: "Use of Barangay Facilities",
    render: formHTML_FORM2_FACILITIES
  },
  "katarungang-pambarangay": {
    title: "Katarungang Pambarangay",
    render: formHTML_FORM3_KATAR
  },
  "certificate-to-file-action": {
    title: "Certificate to File Action",
    render: formHTML_FORM3_FILEACTION
  },
  "barangay-protection-order": {
    title: "Barangay Protection Order",
    render: formHTML_FORM3_BPO
  }
};

/* =========================================================
   RENDER FORM BASED ON SELECT
========================================================= */
function renderSelectedForm() {
  const requestTypeId = requestTypeSelect.value;
  if (!requestTypeId) {
    formContainer.innerHTML = ''; // optional: hide form
    return;
  }

  fetch(`../api/get_request_fields.php?request_type_id=${requestTypeId}`)
    .then(res => res.json())
    .then(fields => {
      if (!fields.length) {
        formContainer.innerHTML = '<p class="text-center">No fields configured.</p>';
        return;
      }

      // 1️⃣ Render the form HTML
      renderDynamicKioskForm(fields);

      initializeDatePickers(); // ← keeps flatpickr working
      wireAutoAge();       // ← wire up bday -> age behavior
      initFormBehaviors();
    })
    .catch(err => {
      console.error(err);
      formContainer.innerHTML = '<p class="text-danger">Failed to load form.</p>';
    });
}


// ---------- Auto-age calculation from birthday ----------
function computeAgeFromDOB(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob)) return '';
  const today = new Date();
  // use only date portion to avoid timezone issues
  const y = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  const d = today.getDate() - dob.getDate();
  let age = y;
  if (m < 0 || (m === 0 && d < 0)) age = y - 1;
  if (age < 0) return ''; // future date -> empty
  return age;
}

// call this function to wire up the bday -> age behavior
function wireAutoAge() {
  const bdayInput = document.getElementById("bday");
  const ageInput = document.getElementById("age");

  if (!bdayInput || !ageInput) return;

  bdayInput.addEventListener("change", () => {
    const age = computeAgeFromDOB(bdayInput.value);
    ageInput.value = age !== "" ? age : "";
  });
}


// ---------- Form Behaviors (fixed) ----------
let _globalDocClickHandler = null;
let _focusInHandler = null;
let _focusOutHandler = null;

/* =========================================================
   ATTACH VALIDATION TO DYNAMIC FORM
========================================================= */
function initFormBehaviors() {
  const formEl = document.getElementById('activeForm');
  if (!formEl) return;

  // prevent duplicate submit handlers safely
  formEl.onsubmit = null;

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    validateAndConfirm(formEl);
  });
}


/* =========================================================
   VALIDATION + CONFIRMATION
========================================================= */
function validateAndConfirm(formEl) {
  const invalids = [];
  const errorNode = formEl.querySelector('#formError');

  if (errorNode) errorNode.style.display = 'none';

  // ---------- DATE VALIDATION ----------
  const today = new Date();
  const dateInputs = Array.from(formEl.querySelectorAll('input[type="date"]'));

  dateInputs.forEach(di => {
    if (!di.value) return;
    // Parse m/d/Y safely (Flatpickr format)
    const parts = di.value.split('/');
    if (parts.length === 3) {
      const v = new Date(
        Number(parts[2]),        // year
        Number(parts[0]) - 1,    // month (0-based)
        Number(parts[1])         // day
      );

      if (!isNaN(v) && v > today) {
        invalids.push(di);
        markInvalid(di);
      }
    }
  });

  // ---------- BIRTHDAY / AGE CHECK ----------
  const bdayEl = formEl.querySelector('#bday');
  if (bdayEl && bdayEl.value) {
    const age = computeAgeFromDOB(bdayEl.value);
    if (age === '' || age < 8) {
      invalids.push(bdayEl);
      markInvalid(bdayEl);
    }
  }

  if (invalids.length) {
    if (errorNode) errorNode.style.display = 'block';
    focusFirstInvalid(invalids);
    return;
  }

  // ---------- CONFIRM MODAL ----------
  const modalEl = document.getElementById('confirmModal');
  // const confirmModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  console.log('✅ validation passed, showing confirm modal');
  const confirmNo = modalEl.querySelector('#confirmNo');
  const confirmYes = modalEl.querySelector('#confirmYes');

  window._pendingForm = formEl;
  populateConfirmDetails(formEl);

  const confirmModal = new bootstrap.Modal(
    document.getElementById("confirmModal")
  );

  confirmModal.show();


  // remove old listeners
  confirmNo.replaceWith(confirmNo.cloneNode(true));
  confirmYes.replaceWith(confirmYes.cloneNode(true));

  modalEl.querySelector('#confirmNo').addEventListener('click', () => {
    confirmModal.hide();
  });

  modalEl.querySelector('#confirmYes').addEventListener('click', () => {
    confirmModal.hide();
    submitRequest(formEl, true)
    showSummary(formEl);
  });
}

function populateConfirmDetails() {
  const formEl = document.querySelector("#activeForm");
  const container = document.getElementById("confirmDetails");

  if (!formEl || !container) {
    console.error("❌ confirmDetails container not found");
    return;
  }

  let html = `<ul class="list-group list-group-flush">`;

  Array.from(formEl.elements).forEach(el => {
    if (!el.name || el.type === "submit") return;
    if (el.type === "radio" && !el.checked) return;

    const value = el.value?.trim() || "(blank)";

    const label =
      formEl.querySelector(`label[for="${el.id}"]`)?.innerText ||
      el.name.replace(/_/g, " ").toUpperCase();

    html += `
      <li class="list-group-item d-flex justify-content-between">
        <strong>${label}</strong>
        <span>${value}</span>
      </li>
    `;
  });

  html += `</ul>`;
  container.innerHTML = html;
}



function submitRequest(formEl, showSummaryAfter = false) {
  const fields = {};

  Array.from(formEl.elements).forEach(el => {
    if (!el.name || el.type === "submit") return;

    if (el.type === "radio") {
      if (el.checked) fields[el.name] = el.value;
    } else {
      fields[el.name] = el.value;
    }
  });

  const payload = {
    type_id: requestTypeSelect.value,
    fields
  };

  fetch("../api/submit_request.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "Submission failed");
        return;
      }

      if (showSummaryAfter) {
        showSummary(formEl, data.ref_number);
      }

      formEl.reset();
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}




/* =========================================================
   SUMMARY + PRINT
========================================================= */
function showSummary(formEl, refNumber) {
  // const ref = randRef();
  const ref = refNumber;
  const summaryBody = document.getElementById('summaryBody');
  const entries = {};

  Array.from(formEl.elements).forEach(el => {
    if (!el.name) return;

    if (el.type === 'checkbox') {
      if (!entries[el.name]) entries[el.name] = [];
      if (el.checked) entries[el.name].push(el.value || 'Yes');
    } else if (el.type === 'radio') {
      if (el.checked) entries[el.name] = el.value;
    } else {
      entries[el.name] = el.value ?? '';
    }
  });

  const selectedText =
    requestTypeSelect.options[requestTypeSelect.selectedIndex]?.text || '';

  let html = `
    <p><strong>Request Type:</strong> ${selectedText}</p>
    <p><strong>Reference Number:</strong> ${ref}</p>
    <hr>
  `;

  for (const [k, v] of Object.entries(entries)) {
    const displayVal = Array.isArray(v) ? v.join(', ') : (v || '<em>(blank)</em>');
    html += `<p><strong>${k}:</strong> ${displayVal}</p>`;
  }

  summaryBody.innerHTML = html;

  const summaryModal = new bootstrap.Modal(
    document.getElementById('summaryModal')
  );
  summaryModal.show();

  const printBtn = document.getElementById('printReceiptBtn');
  const cleanPrint = printBtn.cloneNode(true);
  printBtn.replaceWith(cleanPrint);

  cleanPrint.addEventListener('click', () => {
    document.getElementById('printingOverlay').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('printingOverlay').style.display = 'none';
      summaryModal.hide();

      // ✅ correct place
      window.scannedData = null;

      window.location.href = '../index.html';
      formEl.reset();
    }, 3000);
  });

}

// ---------- startup ----------
// requestTypeSelect.addEventListener('change', renderSelectedForm);
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  requestTypeSelect = document.getElementById('requestTypeSelect');
  formContainer = document.getElementById('formContainer');

  // ✅ EXIT SILENTLY IF NOT ON REQUEST PAGE
  if (!requestTypeSelect || !formContainer) {
    return;
  }

  console.log('✅ script.js connected on request page');

  // requestTypeSelect.addEventListener('change', renderSelectedForm);

  if (requestTypeSelect.value) {
    renderSelectedForm();
  }
});


// autofill.js

function renderDynamicKioskForm(fields) {
  const form = document.getElementById("activeForm");
  if (!form) return;
  form.noValidate = true;

  fields.forEach(f => {
    const group = document.createElement("div");
    group.className = "mb-3";

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = f.label;

    let input;
    if (f.field_type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = f.field_type;
    }

    input.name = f.field_key;
    input.id = f.field_key; // ⭐ REQUIRED FOR AUTOFILL
    input.className = "form-control";
    input.autocomplete = "off";

    if (Number(f.is_required) === 1) {
      input.required = true;
    }

    group.append(label, input);
    form.appendChild(group);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary w-100 mt-3";
  submitBtn.textContent = "Submit Request";
  form.appendChild(submitBtn);

  formContainer.innerHTML = "";
  formContainer.appendChild(form);

  initFormBehaviors();
  initializeDatePickers();

  // 🔥 auto-fill from scanned ID if available
  if (window.applyAutofillIfAvailable) {
    window.applyAutofillIfAvailable();
  }
}
