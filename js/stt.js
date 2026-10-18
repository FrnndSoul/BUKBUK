// stt.js
// Speech-to-text correction with safe, non-destructive merging
//stt fixed merge
const micBtn = document.getElementById("micToggleBtn")

let listening = false
let recorder = null
let chunks = []

if (micBtn) {
  micBtn.addEventListener("click", async () => {
    if (listening) {
      recorder.stop()
      micBtn.textContent = "🎤"
      listening = false
      return
    }
// autofill.js

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recorder = new MediaRecorder(stream)
      chunks = []

      recorder.ondataavailable = e => chunks.push(e.data)

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        const reader = new FileReader()

        reader.onloadend = async () => {
          try {
            const audio = reader.result.split(",")[1]

            // 1. STT
            const sttRes = await fetch(
              "https://backend-gol6.onrender.com/stt",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio })
              }
            )

            const { text } = await sttRes.json()
            if (!text) return

            // 2. Collect current state (truth source)
            const form = document.getElementById("activeForm")
            const current = {}

            if (form) {
              form.querySelectorAll("input, textarea, select").forEach(el => {
                if (!el.id) return
                if (el.type === "radio") {
                  if (el.checked) current[el.id] = el.value
                } else {
                  current[el.id] = el.value
                }
              })
            }

            // 3. Correction request
            const fixRes = await fetch(
              "https://backend-gol6.onrender.com/correct",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  transcript: text,
                  current
                })
              }
            )

            const { result } = await fixRes.json()
            if (!result || Object.keys(result).length === 0) return

            // 4. Apply corrections ONLY for mentioned keys
            Object.entries(result).forEach(([key, value]) => {
              if (value === undefined || value === null) return

              const input = form.querySelector(`#${key}`)
              if (!input) return

              if (key === "sex") {
                if (value === "M") value = "Male"
                if (value === "F") value = "Female"
              }

              if (input.type === "radio") {
                const radio = form.querySelector(
                  `input[name="${input.name}"][value="${value}"]`
                )
                if (radio) radio.checked = true
              } else {
                input.value = value
              }

              input.dispatchEvent(new Event("input", { bubbles: true }))
              input.dispatchEvent(new Event("change", { bubbles: true }))
            })

            // 5. SAFE MERGE back into scannedData
            if (window.scannedData) {
              Object.assign(window.scannedData, result)
            }

          } catch (err) {
            console.error("❌ STT correction failed:", err)
          }
        }

        reader.readAsDataURL(blob)
      }

      recorder.start()
      micBtn.textContent = "🛑"
      listening = true

    } catch (err) {
      console.error("❌ Microphone error:", err)
    }
  })
}
