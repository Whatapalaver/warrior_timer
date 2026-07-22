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

    // Preserve any existing metronome query params from the current URL
    const currentUrl = new URL(window.location.href)
    const params = new URLSearchParams()
    const metronome = currentUrl.searchParams.get('metronome')
    const bpm = currentUrl.searchParams.get('bpm')
    if (metronome) params.set('metronome', metronome)
    if (bpm) params.set('bpm', bpm)

    let url = `/timer/${newIntervals}`
    const queryString = params.toString()
    if (queryString) url += `?${queryString}`

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
