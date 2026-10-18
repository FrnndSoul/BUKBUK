// autofill.js
// Responsible only for mapping scanned ID data into form fields
// autofill.js

(function () {
  function autofillForm(formEl, data) {
    if (!formEl || !data) return;

    const map = {
      // common personal info
      full_name: ['fullName', 'name', 'complainantName', 'ctfaName', 'bpoName'],
      address: ['address', 'complainantAddress', 'respondentAddress', 'ctfaAddress', 'bpoAddress'],
      birthdate: ['bday'],
      age: ['age'],
      civil_status: ['civilStatus'],
      sex: ['sex'],
      contact_number: ['contactNum'],
      email_address: ['email'],
      purpose: ['purpose'],
      length_of_stay_brgy_ugong: ['lengthOfStay'],

      // construction
      'construction.owner_name': ['ownerName'],
      'construction.position': ['position'],

      // complaints
      'complaint.respondent_name': ['respondentName'],
      'complaint.respondent_address': ['respondentAddress'],
      'complaint.complaint_type': ['complaintType'],
      'complaint.complaint_body': ['complaintBody']
    };

    Object.entries(map).forEach(([dataKey, fieldIds]) => {
      const value = getNestedValue(data, dataKey);
      if (!value) return;

      fieldIds.forEach(id => {
        const el = formEl.querySelector(`#${id}`);
        if (!el) return;

        if (el.type === 'radio') {
          const radio = formEl.querySelector(
            `input[name="${el.name}"][value="${value}"]`
          );
          if (radio) radio.checked = true;
        } else {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : null), obj);
  }

  // Public hook
  window.applyAutofillIfAvailable = function () {
      const form = document.getElementById("activeForm");
      const data = window.scannedData;

      console.log("🟢 autofill running");
      console.log("form:", form);
      console.log("data:", data);

      if (!form || !data) return;

      Object.keys(data).forEach(key => {
        const input = form.querySelector(`#${key}`);
        console.log("trying key:", key, "found:", input);

        if (!input) return;

        let value = data[key];

        // normalize sex
        if (key === "sex") {
          if (value === "M") value = "Male";
          if (value === "F") value = "Female";
        }

        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    };
})();