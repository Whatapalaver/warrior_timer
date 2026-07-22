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

    // Preserve metronome state from live DOM, falling back to URL params
    const params = new URLSearchParams()
    const metronomeToggle = document.querySelector('[data-metronome-target="toggle"]')
    const metronomeBpm = document.querySelector('[data-metronome-target="bpm"]')
    if (metronomeToggle && metronomeBpm) {
      if (metronomeToggle.checked) {
        params.set('metronome', 'true')
        params.set('bpm', metronomeBpm.value || 60)
      }
    } else {
      const currentUrl = new URL(window.location.href)
      const metronome = currentUrl.searchParams.get('metronome')
      const bpm = currentUrl.searchParams.get('bpm')
      if (metronome) params.set('metronome', metronome)
      if (bpm) params.set('bpm', bpm)
    }

    const queryString = params.toString()
    window.location.href = `/timer/${newIntervals}` + (queryString ? `?${queryString}` : '')
  }
}
