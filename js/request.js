
console.log("request.js loaded");

const kioskLang = localStorage.getItem("kioskLanguage") || "en";

document.addEventListener("DOMContentLoaded", async () => {
  // Keep the existing ID prompt.
  const idModalEl = document.getElementById("idPromptModal");

  if (idModalEl && window.bootstrap?.Modal) {
    const idModal = bootstrap.Modal.getOrCreateInstance(idModalEl);
    idModal.show();

    document.getElementById("idYesBtn")?.addEventListener("click", () => {
      sessionStorage.setItem("hasValidId", "yes");
      idModal.hide();
    });

    document.getElementById("idNoBtn")?.addEventListener("click", () => {
      sessionStorage.setItem("hasValidId", "no");
      idModal.hide();
    });
  }

  const select = document.getElementById("requestTypeSelect");
  if (!select) return;

  try {
    const response = await fetch("../api/request_types.php", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Request types API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(data.error || "Unexpected request types response");
    }

    select.innerHTML =
      '<option value="">-- Select Request Type --</option>';

    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      option.dataset.slug = item.slug || "";
      select.appendChild(option);
    });

    applyRequestLanguage(kioskLang);

    // Render the matching existing template when the selection changes.
    select.addEventListener("change", () => {
      if (typeof window.renderSelectedForm === "function") {
        window.renderSelectedForm();
      } else {
        console.error(
          "renderSelectedForm() is not available. Check script.js."
        );
      }
    });

    console.log("Request types loaded:", data);
  } catch (error) {
    console.error("Failed to load request types:", error);

    const container = document.getElementById("formContainer");

    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger mb-0">
          Unable to load request types.
          Please refresh or contact the administrator.
        </div>
      `;
    }
  }
});

function applyRequestLanguage(lang) {
  const t = window.kioskTranslations?.[lang];
  if (!t) return;

  const heading = document.querySelector("h5.fw-bold");
  if (heading) heading.textContent = t.requestTypes;

  const select = document.getElementById("requestTypeSelect");

  if (select?.options.length) {
    select.options[0].textContent = t.selectRequest;
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.textContent = t.back;

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.textContent = value;
  };

  setText("#confirmModal .modal-title", t.confirmTitle);
  setText("#confirmModal .modal-body", t.confirmText);
  setText("#confirmYes", t.yes);
  setText("#confirmNo", t.no);
  setText("#summaryModal .modal-title", t.submissionSummary);
  setText("#printReceiptBtn", t.print);
  setText("#idPromptModal .modal-title", t.beforeContinue);
  setText("#idPromptModal p", t.haveId);
  setText("#idYesBtn", t.yes);
  setText("#idNoBtn", t.no);
  setText("#cameraModal .modal-title", t.scanId);
  setText("#cameraModal .btn-secondary", t.cancel);
}
