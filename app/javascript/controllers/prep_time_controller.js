import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input"]
  static values = {
    currentIntervals: String
  }

  add() {
    const seconds = parseInt(this.inputTarget.value) || 30
    const prepSegment = `${seconds}p`

    // Get current intervals from the URL or value
    let currentIntervals = this.currentIntervalsValue

    // Remove any existing prep time at the start (e.g., "10p+" or "30p+")
    // This regex matches prep time at the start: digits followed by 'p' and optional '+'
    currentIntervals = currentIntervals.replace(/^\d+p\+?/, '')

    // Prepend new prep time to intervals
    const newIntervals = currentIntervals
      ? `${prepSegment}+${currentIntervals}`
      : prepSegment

    // Update URL and reload
    window.location.href = `/timer/${newIntervals}`
  }
}
