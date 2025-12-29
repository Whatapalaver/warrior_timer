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

    // Preserve metronome settings if they exist
    let url = `/timer/${newIntervals}`
    const urlParams = new URLSearchParams()

    // Check if metronome is enabled
    const metronomeToggle = document.querySelector('[data-timer-target="metronomeToggle"]')
    const metronomeBpm = document.querySelector('[data-timer-target="metronomeBpm"]')

    if (metronomeToggle && metronomeToggle.checked) {
      urlParams.set('metronome', 'true')
      if (metronomeBpm && metronomeBpm.value) {
        urlParams.set('bpm', metronomeBpm.value)
      }
    }

    const queryString = urlParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    // Navigate to the new timer URL
    window.location.href = url
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
