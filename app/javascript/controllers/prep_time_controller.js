import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "controls"]
  static values = {
    currentIntervals: String,
    defaultSeconds: { type: Number, default: 30 }
  }

  connect() {
    this.inputTarget.value = this.defaultSecondsValue
  }

  toggle() {
    this.controlsTarget.classList.toggle("hidden")
  }

  increment() {
    const current = parseInt(this.inputTarget.value) || 0
    this.inputTarget.value = Math.min(current + 5, 300) // max 5 minutes
  }

  decrement() {
    const current = parseInt(this.inputTarget.value) || 0
    this.inputTarget.value = Math.max(current - 5, 5) // min 5 seconds
  }

  add() {
    const seconds = parseInt(this.inputTarget.value) || 30
    const prepSegment = `${seconds}p`

    // Get current intervals from the URL or value
    const currentIntervals = this.currentIntervalsValue

    // Prepend prep time to intervals
    const newIntervals = currentIntervals
      ? `${prepSegment}+${currentIntervals}`
      : prepSegment

    // Update URL and reload
    window.location.href = `/timer/${encodeURIComponent(newIntervals)}`
  }
}
