import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Create audio context for beeps
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  disconnect() {
    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  // Play a beep sound
  beep(frequency = 440, duration = 100, volume = 0.3) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    )

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration / 1000)
  }

  // Countdown beep (3-2-1)
  countdownBeep() {
    this.beep(800, 100, 0.2)
  }

  // Segment transition beep (different tone for work vs rest)
  transitionBeep(segmentType) {
    if (segmentType === 'work') {
      // Higher, more urgent beep for work
      this.beep(1000, 200, 0.3)
    } else if (segmentType === 'rest') {
      // Lower, calmer beep for rest
      this.beep(400, 200, 0.3)
    } else {
      // Default beep
      this.beep(600, 200, 0.3)
    }
  }

  // Workout complete sound (two beeps)
  completeSound() {
    this.beep(800, 150, 0.3)
    setTimeout(() => {
      this.beep(1000, 150, 0.3)
    }, 200)
  }
}
