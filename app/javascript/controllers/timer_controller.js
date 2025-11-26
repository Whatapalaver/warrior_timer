import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "countdown",
    "segmentType",
    "roundInfo",
    "progress",
    "startPauseButton"
  ]

  static values = {
    segments: Array
  }

  connect() {
    this.currentSegmentIndex = -1  // -1 means ready state
    this.timeRemaining = 0
    this.isRunning = false
    this.intervalId = null

    // Get audio controller if available
    this.audioController = this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller~="audio"]'),
      "audio"
    )

    if (this.hasSegmentsValue && this.segmentsValue.length > 0) {
      this.updateDisplay()
    }
  }

  disconnect() {
    this.stop()
  }

  startPause() {
    if (this.isRunning) {
      this.pause()
    } else {
      this.start()
    }
  }

  start() {
    if (this.currentSegmentIndex === -1) {
      // Start from the beginning
      this.currentSegmentIndex = 0
      this.loadSegment()
    }

    this.isRunning = true
    this.startPauseButtonTarget.textContent = "Pause"

    // Start the countdown
    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)
  }

  pause() {
    this.isRunning = false
    this.startPauseButtonTarget.textContent = "Resume"
    this.stop()
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  reset() {
    this.stop()
    this.currentSegmentIndex = -1
    this.timeRemaining = 0
    this.isRunning = false
    this.startPauseButtonTarget.textContent = "Start"
    this.updateDisplay()
  }

  skip() {
    if (this.currentSegmentIndex >= 0 && this.currentSegmentIndex < this.segmentsValue.length - 1) {
      this.currentSegmentIndex++
      this.loadSegment()
    } else if (this.currentSegmentIndex === this.segmentsValue.length - 1) {
      // At the last segment, finish
      this.complete()
    }
  }

  tick() {
    this.timeRemaining--

    // Play countdown beeps at 3, 2, 1
    if (this.timeRemaining >= 1 && this.timeRemaining <= 3 && this.audioController) {
      this.audioController.countdownBeep()
    }

    if (this.timeRemaining <= 0) {
      // Segment complete - play transition beep
      if (this.currentSegmentIndex < this.segmentsValue.length - 1) {
        const nextSegment = this.segmentsValue[this.currentSegmentIndex + 1]
        if (this.audioController) {
          this.audioController.transitionBeep(nextSegment.segment_type)
        }

        // Move to next segment
        this.currentSegmentIndex++
        this.loadSegment()
      } else {
        // Workout complete
        if (this.audioController) {
          this.audioController.completeSound()
        }
        this.complete()
      }
    } else {
      this.updateDisplay()
    }
  }

  loadSegment() {
    const segment = this.segmentsValue[this.currentSegmentIndex]
    this.timeRemaining = segment.duration_seconds
    this.updateDisplay()
    this.updateBackgroundColor()
  }

  complete() {
    this.stop()
    this.isRunning = false
    this.segmentTypeTarget.textContent = "Complete!"
    this.countdownTarget.textContent = "00:00"
    this.roundInfoTarget.textContent = ""
    this.startPauseButtonTarget.textContent = "Start"

    // Reset to ready state
    this.currentSegmentIndex = -1
  }

  updateDisplay() {
    if (this.currentSegmentIndex === -1) {
      // Ready state
      this.segmentTypeTarget.textContent = "Ready"
      this.countdownTarget.textContent = "00:00"
      this.roundInfoTarget.textContent = ""
      this.progressTarget.textContent = `Segment 0 of ${this.segmentsValue.length}`
    } else {
      const segment = this.segmentsValue[this.currentSegmentIndex]

      // Update segment type
      this.segmentTypeTarget.textContent = this.formatSegmentType(segment.segment_type)

      // Update countdown
      this.countdownTarget.textContent = this.formatTime(this.timeRemaining)

      // Update round info
      if (segment.round_number) {
        this.roundInfoTarget.textContent = `Round ${segment.round_number} of ${segment.total_rounds}`
      } else {
        this.roundInfoTarget.textContent = ""
      }

      // Update progress
      this.progressTarget.textContent = `Segment ${this.currentSegmentIndex + 1} of ${this.segmentsValue.length}`
    }
  }

  updateBackgroundColor() {
    const colors = {
      prepare: "bg-amber-500 text-slate-900",
      warmup: "bg-orange-500 text-white",
      work: "bg-red-600 text-white",
      rest: "bg-emerald-500 text-slate-900",
      cooldown: "bg-sky-500 text-white"
    }

    const segment = this.segmentsValue[this.currentSegmentIndex]
    const colorClass = colors[segment.segment_type] || colors.work

    // Remove all color classes
    Object.values(colors).forEach(c => {
      c.split(' ').forEach(cls => this.element.classList.remove(cls))
    })

    // Add new color classes
    colorClass.split(' ').forEach(cls => this.element.classList.add(cls))
  }

  formatSegmentType(type) {
    const types = {
      prepare: "Prepare",
      warmup: "Warm Up",
      work: "Work",
      rest: "Rest",
      cooldown: "Cool Down"
    }
    return types[type] || type.toString().toUpperCase()
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}
