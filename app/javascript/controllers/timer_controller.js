import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "countdown",
    "segmentType",
    "roundInfo",
    "progress",
    "startPauseButton",
    "overviewSegment",
    "mobileSegment",
    "progressBar",
    "timeRemaining"
  ]

  static outlets = ["audio"]

  static values = {
    segments: Array
  }

  connect() {
    this.currentSegmentIndex = -1  // -1 means ready state
    this.timeRemaining = 0
    this.isRunning = false
    this.intervalId = null

    if (this.hasSegmentsValue && this.segmentsValue.length > 0) {
      this.updateDisplay()
    }

    // Add keyboard shortcut for spacebar
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)
  }

  disconnect() {
    this.stop()
    document.removeEventListener('keydown', this.handleKeydown)
  }

  handleKeydown(event) {
    // Spacebar to start/pause
    if (event.code === 'Space') {
      event.preventDefault()
      this.startPause()
    }
  }

  startPause() {
    if (this.isRunning) {
      this.pause()
    } else {
      this.start()
    }
  }

  start() {
    // Enable audio on first user interaction
    if (this.hasAudioOutlet) {
      this.audioOutlet.resume()
    }

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
    if (this.timeRemaining >= 1 && this.timeRemaining <= 3 && this.hasAudioOutlet) {
      this.audioOutlet.countdownBeep()
    }

    if (this.timeRemaining <= 0) {
      // Segment complete - play transition beep
      if (this.currentSegmentIndex < this.segmentsValue.length - 1) {
        const nextSegment = this.segmentsValue[this.currentSegmentIndex + 1]
        if (this.hasAudioOutlet) {
          this.audioOutlet.transitionBeep(nextSegment.segment_type)
        }

        // Move to next segment
        this.currentSegmentIndex++
        this.loadSegment()
      } else {
        // Workout complete
        if (this.hasAudioOutlet) {
          this.audioOutlet.completeSound()
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
      this.highlightOverviewSegment(-1)
      this.updateMobileProgress()
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

      // Highlight current segment in overview
      this.highlightOverviewSegment(this.currentSegmentIndex)

      // Update mobile progress
      this.updateMobileProgress()
    }
  }

  highlightOverviewSegment(index) {
    if (!this.hasOverviewSegmentTarget) return

    this.overviewSegmentTargets.forEach((segment, i) => {
      if (i === index) {
        segment.classList.add('ring-2', 'ring-white')
        segment.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } else {
        segment.classList.remove('ring-2', 'ring-white')
      }
    })
  }

  updateMobileProgress() {
    // Update mobile segment highlights
    if (this.hasMobileSegmentTarget) {
      this.mobileSegmentTargets.forEach((segment, i) => {
        if (i === this.currentSegmentIndex) {
          segment.classList.remove('opacity-50')
          segment.classList.add('opacity-100', 'ring-2', 'ring-white')
          segment.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } else if (i < this.currentSegmentIndex) {
          segment.classList.add('opacity-30')
          segment.classList.remove('opacity-50', 'opacity-100', 'ring-2', 'ring-white')
        } else {
          segment.classList.add('opacity-50')
          segment.classList.remove('opacity-30', 'opacity-100', 'ring-2', 'ring-white')
        }
      })
    }

    // Update progress bar
    if (this.hasProgressBarTarget) {
      const totalSegments = this.segmentsValue.length
      const progress = this.currentSegmentIndex === -1 ? 0 : ((this.currentSegmentIndex + 1) / totalSegments) * 100
      this.progressBarTarget.style.width = `${progress}%`
    }

    // Update time remaining
    if (this.hasTimeRemainingTarget) {
      if (this.currentSegmentIndex === -1) {
        const totalTime = this.segmentsValue.reduce((sum, s) => sum + s.duration_seconds, 0)
        this.timeRemainingTarget.textContent = this.formatTime(totalTime)
      } else {
        // Calculate remaining time: current segment time + all future segments
        let remainingTime = this.timeRemaining
        for (let i = this.currentSegmentIndex + 1; i < this.segmentsValue.length; i++) {
          remainingTime += this.segmentsValue[i].duration_seconds
        }
        this.timeRemainingTarget.textContent = this.formatTime(remainingTime)
      }
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
