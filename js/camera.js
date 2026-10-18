document.addEventListener("DOMContentLoaded", () => {
  const idYesBtn = document.getElementById("idYesBtn")
  const idPromptModalEl = document.getElementById("idPromptModal")
  const cameraModalEl = document.getElementById("cameraModal")
  const video = document.getElementById("idCamera")
  const scanBtn = document.getElementById("scanBtn")
  const statusText = document.getElementById("scan-status")

  if (!idYesBtn || !cameraModalEl || !video || !scanBtn) return

  let stream = null

  const cameraModal = new bootstrap.Modal(cameraModalEl)
  const idPromptModal = bootstrap.Modal.getOrCreateInstance(idPromptModalEl)

  async function openCamera() {
    if (stream) return
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    })
    video.srcObject = stream
    await video.play()
  }
// autofill.js

  function closeCamera() {
    if (!stream) return
    stream.getTracks().forEach(t => t.stop())
    stream = null
    video.srcObject = null
  }

  idYesBtn.addEventListener("click", async () => {
    try {
      await openCamera()
      idPromptModal.hide()
      cameraModal.show()
      if (statusText) statusText.textContent = "Waiting for document"
    } catch {
      alert("Camera unavailable")
    }
  })

  scanBtn.addEventListener("click", async () => {
    if (!stream || video.videoWidth === 0) return

    scanBtn.disabled = true
    if (statusText) statusText.textContent = "Reading document"

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)

    const image = canvas.toDataURL("image/jpeg")

    try {
      const res = await fetch("https://backend-gol6.onrender.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      })

      const data = await res.json()
      const r = data.result || {}

      window.scannedData = {
        document_type: r.document_type || "",
        expiration_date: r.expiration_date || "",

        full_name: r.full_name || "",
        contact_number: r.contact_number || "",
        email_address: r.email_address || "",
        address: r.address || "",
        birthdate: r.birthdate || "",
        age: r.age || "",
        civil_status: r.civil_status || "",
        length_of_stay_brgy_ugong: r.length_of_stay_brgy_ugong || "",
        sex: r.sex || "",

        purpose: r.purpose || "",
        proof_of_address: r.proof_of_address || "",

        construction: {
          owner_name: r.construction?.owner_name || "",
          position: r.construction?.position || "",
          type: r.construction?.type || "",
          others_specify: r.construction?.others_specify || ""
        },

        complaint: {
          respondent_name: r.complaint?.respondent_name || "",
          respondent_address: r.complaint?.respondent_address || "",
          complaint_type: r.complaint?.complaint_type || "",
          complaint_body: r.complaint?.complaint_body || ""
        }
      }

      cameraModal.hide()
    } catch {
      alert("Scan failed. Please try again.")
    } finally {
      scanBtn.disabled = false
      if (statusText) statusText.textContent = "Waiting for document"
    }
  })

  cameraModalEl.addEventListener("hidden.bs.modal", () => {
    closeCamera()
  })
})
