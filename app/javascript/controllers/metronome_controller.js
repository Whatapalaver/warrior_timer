import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toggle", "bpm"]

  connect() {
    const params = new URLSearchParams(window.location.search)
    this.toggleTarget.checked = params.get('metronome') === 'true'
    const bpm = params.get('bpm')
    if (bpm) this.bpmTarget.value = bpm
  }

  apply() {
    const url = new URL(window.location.href)
    if (this.toggleTarget.checked) {
      url.searchParams.set('metronome', 'true')
      url.searchParams.set('bpm', this.bpmTarget.value || 60)
    } else {
      url.searchParams.delete('metronome')
      url.searchParams.delete('bpm')
    }
    window.location.href = url.toString()
  }

  preventPropagation(event) {
    event.stopPropagation()
  }
}
