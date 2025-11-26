import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button"]
  static values = {
    url: String
  }

  copy(event) {
    event.preventDefault()

    const url = this.urlValue || window.location.href

    navigator.clipboard.writeText(url).then(() => {
      // Show success feedback
      const originalText = this.buttonTarget.innerHTML
      this.buttonTarget.innerHTML = "✓ Copied!"
      this.buttonTarget.classList.add("bg-emerald-600")
      this.buttonTarget.classList.remove("bg-slate-800/80", "hover:bg-slate-700/80")

      setTimeout(() => {
        this.buttonTarget.innerHTML = originalText
        this.buttonTarget.classList.remove("bg-emerald-600")
        this.buttonTarget.classList.add("bg-slate-800/80", "hover:bg-slate-700/80")
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
      // Fallback: show the URL in an alert
      alert(`Copy this URL: ${url}`)
    })
  }
}
