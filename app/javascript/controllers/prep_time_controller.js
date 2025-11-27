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
    const currentIntervals = this.currentIntervalsValue

    // Prepend prep time to intervals
    const newIntervals = currentIntervals
      ? `${prepSegment}+${currentIntervals}`
      : prepSegment

    // Update URL and reload - don't encode the intervals string
    window.location.href = `/timer/${newIntervals}`
  }
}
