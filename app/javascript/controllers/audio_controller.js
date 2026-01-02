import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Create audio context for beeps
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.enabled = false
  }

  disconnect() {
    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  // Resume audio context (call this on user interaction)
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    this.enabled = true
  }

  // Play a beep sound
  beep(frequency = 440, duration = 100, volume = 0.3) {
    if (!this.audioContext || !this.enabled) return

    // Ensure audio context is running
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

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
    this.beep(800, 100, 0.8)
  }

  // Segment transition beep (different tone for work vs rest)
  transitionBeep(segmentType) {
    if (segmentType === 'work') {
      // Higher, more urgent beep for work
      this.beep(1000, 200, 0.8)
    } else if (segmentType === 'rest') {
      // Lower, calmer beep for rest
      this.beep(400, 200, 0.8)
    } else {
      // Default beep
      this.beep(600, 200, 0.8)
    }
  }

  // Workout complete sound (two beeps)
  completeSound() {
    this.beep(800, 150, 0.8)
    setTimeout(() => {
      this.beep(1000, 150, 0.8)
    }, 200)
  }

  // Metronome beep (low frequency, short duration)
  metronomeBeep() {
    this.beep(200, 50, 0.7)
  }
}
