import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["displayMode", "editMode", "input", "editButton"]
  static values = {
    currentIntervals: String
  }

  toggleEdit() {
    this.displayModeTarget.classList.toggle('hidden')
    this.editModeTarget.classList.toggle('hidden')

    if (!this.editModeTarget.classList.contains('hidden')) {
      // Focus the input when entering edit mode
      this.inputTarget.focus()
      this.inputTarget.select()
    }
  }

  cancel() {
    // Reset input to original value
    this.inputTarget.value = this.currentIntervalsValue
    this.toggleEdit()
  }

  apply() {
    const newIntervals = this.inputTarget.value.trim()

    if (!newIntervals) {
      alert('Please enter a valid interval definition')
      return
    }

    // Navigate to the new timer URL - don't encode
    window.location.href = `/timer/${newIntervals}`
  }

  // Prevent keyboard events from propagating to timer controls
  preventPropagation(event) {
    event.stopPropagation()
  }

  // Allow Enter to apply, Escape to cancel
  connect() {
    this.inputTarget.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.apply()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        this.cancel()
      }
    })
  }
}
