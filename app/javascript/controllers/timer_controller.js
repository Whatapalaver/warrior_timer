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
    "timeRemaining",
    "metronomeToggle",
    "metronomeBpm",
    "navButtons",
    "setupControls",
    "mobileProgress",
    "metronomeBar",
    "metronomeBarFill"
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
    this.metronomeEnabled = false
    this.metronomeBpm = 60
    this.metronomeIntervalId = null
    this.wakeLock = null

    if (this.hasSegmentsValue && this.segmentsValue.length > 0) {
      this.updateDisplay()
    }

    // Add keyboard shortcut for spacebar
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)

    // Initialize metronome settings from URL params or defaults
    this.initializeMetronomeFromURL()

    // Hide global metronome controls if any segment has per-interval bpm
    this.hideGlobalMetronomeIfNeeded()
  }

  disconnect() {
    this.stop()
    this.stopMetronome()
    this.releaseWakeLock()
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

      // Add to recent history on first start
      this.dispatch('addToRecent', { target: document.querySelector('[data-controller~="workout-storage"]') })
    }

    this.isRunning = true
    this.startPauseButtonTarget.textContent = "Pause"

    // Hide setup controls and nav buttons when running
    this.hideSetupUI()

    // Keep screen awake during workout
    this.requestWakeLock()

    // Start the countdown
    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)

    // Start metronome if enabled and in work segment
    this.updateMetronome()
  }

  pause() {
    this.isRunning = false
    this.startPauseButtonTarget.textContent = "Resume"
    this.stop()
    this.stopMetronome()
    this.releaseWakeLock()
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  reset() {
    this.stop()
    this.stopMetronome()
    this.releaseWakeLock()
    this.currentSegmentIndex = -1
    this.timeRemaining = 0
    this.isRunning = false
    this.startPauseButtonTarget.textContent = "Start"
    this.updateDisplay()
    this.resetBackgroundColor()
    this.showSetupUI()
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
    this.updateMetronome()
  }

  complete() {
    this.stop()
    this.stopMetronome()
    this.releaseWakeLock()
    this.isRunning = false
    this.segmentTypeTarget.textContent = "Complete!"
    this.countdownTarget.textContent = "00:00"
    this.roundInfoTarget.textContent = ""
    this.startPauseButtonTarget.textContent = "Start"

    // Reset to ready state
    this.currentSegmentIndex = -1
    this.resetBackgroundColor()
    this.showSetupUI()
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

      // Update segment type - show name if present, otherwise show type
      if (segment.name) {
        this.segmentTypeTarget.textContent = segment.name.toUpperCase()
      } else {
        this.segmentTypeTarget.textContent = this.formatSegmentType(segment.segment_type)
      }

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
          segment.classList.remove('opacity-60', 'opacity-40', 'border-transparent')
          segment.classList.add('opacity-100', 'border-white')
          segment.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } else if (i < this.currentSegmentIndex) {
          segment.classList.remove('opacity-60', 'opacity-100', 'border-white')
          segment.classList.add('opacity-40', 'border-transparent')
        } else {
          segment.classList.remove('opacity-40', 'opacity-100', 'border-white')
          segment.classList.add('opacity-60', 'border-transparent')
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

    // Remove all color classes including default
    Object.values(colors).forEach(c => {
      c.split(' ').forEach(cls => this.element.classList.remove(cls))
    })
    this.element.classList.remove('bg-slate-900', 'text-white')

    // Add new color classes
    colorClass.split(' ').forEach(cls => this.element.classList.add(cls))
  }

  resetBackgroundColor() {
    // Explicitly remove all possible background and text color classes
    this.element.classList.remove('bg-amber-500', 'bg-orange-500', 'bg-red-600', 'bg-emerald-500', 'bg-sky-500')
    this.element.classList.remove('text-slate-900', 'text-white')

    // Then add back the default classes
    this.element.classList.add('bg-slate-900', 'text-white')
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

  // Initialize metronome from URL parameters
  initializeMetronomeFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    const metronomeEnabled = urlParams.get('metronome') === 'true'
    const bpm = urlParams.get('bpm')

    if (this.hasMetronomeBpmTarget) {
      const bpmValue = bpm ? parseInt(bpm) : 60
      this.metronomeBpm = bpmValue
      this.metronomeBpmTarget.value = bpmValue
    }

    if (this.hasMetronomeToggleTarget) {
      this.metronomeToggleTarget.checked = metronomeEnabled
      this.metronomeEnabled = metronomeEnabled
    }
  }

  // Metronome controls
  toggleMetronome() {
    this.metronomeEnabled = this.hasMetronomeToggleTarget ? this.metronomeToggleTarget.checked : false
    console.log('Metronome toggled:', this.metronomeEnabled)
    this.updateMetronome()
  }

  updateMetronomeBpm() {
    this.metronomeBpm = parseInt(this.metronomeBpmTarget.value)
    console.log('BPM updated:', this.metronomeBpm)
    if (this.metronomeEnabled) {
      // Restart metronome with new BPM if it's running
      this.updateMetronome()
    }
  }

  updateMetronome() {
    // Stop existing metronome
    this.stopMetronome()

    if (!this.isRunning || this.currentSegmentIndex < 0) return

    const segment = this.segmentsValue[this.currentSegmentIndex]

    // Check if segment has per-interval bpm
    if (segment.bpm) {
      // Use per-segment bpm (overrides global metronome)
      console.log('Starting metronome at segment bpm:', segment.bpm)
      this.startMetronome(segment.bpm)
    } else if (this.hasMetronomeToggleTarget && this.metronomeToggleTarget.checked && segment.segment_type === 'work') {
      // Use global metronome for work segments
      console.log('Starting metronome at global bpm:', this.metronomeBpm)
      this.startMetronome(this.metronomeBpm)
    }
  }

  startMetronome(bpm) {
    const effectiveBpm = bpm || this.metronomeBpm
    const interval = (60 / effectiveBpm) * 1000 // Convert BPM to milliseconds

    // Show the visual metronome bar and start moving right
    this.showMetronomeBar()
    this.metronomeDirection = true // true = right, false = left

    // Play the first beep immediately and kick off the animation
    if (this.hasAudioOutlet) {
      this.audioOutlet.metronomeBeep()
    }
    this.applyMetronomeBarAnimation(interval)

    this.metronomeIntervalId = setInterval(() => {
      if (this.hasAudioOutlet) {
        this.audioOutlet.metronomeBeep()
      }
      // Flip direction and animate
      this.metronomeDirection = !this.metronomeDirection
      this.applyMetronomeBarAnimation(interval)
    }, interval)
  }

  stopMetronome() {
    if (this.metronomeIntervalId) {
      clearInterval(this.metronomeIntervalId)
      this.metronomeIntervalId = null
    }
    this.hideMetronomeBar()
  }

  showMetronomeBar() {
    if (this.hasMetronomeBarTarget) {
      this.metronomeBarTarget.classList.remove('hidden')
    }
  }

  hideMetronomeBar() {
    if (this.hasMetronomeBarTarget) {
      this.metronomeBarTarget.classList.add('hidden')
      // Remove any inline animation styles from the fill
      if (this.hasMetronomeBarFillTarget) {
        this.metronomeBarFillTarget.style.animation = ''
      }
    }
  }

  applyMetronomeBarAnimation(intervalMs) {
    if (!this.hasMetronomeBarFillTarget) return
    const fill = this.metronomeBarFillTarget
    const durationSec = intervalMs / 1000
    const name = this.metronomeDirection ? 'metronome-right' : 'metronome-left'

    // Force a reflow to restart the animation cleanly
    fill.style.animation = 'none'
    void fill.offsetWidth // trigger reflow
    fill.style.animation = `${name} ${durationSec}s linear forwards`
  }

  // UI visibility helpers
  hideSetupUI() {
    // Hide nav buttons (Home, Copy Link)
    if (this.hasNavButtonsTarget) {
      this.navButtonsTarget.style.opacity = '0'
      this.navButtonsTarget.style.pointerEvents = 'none'
    }

    // Hide setup controls (Prep Time, Metronome)
    if (this.hasSetupControlsTarget) {
      this.setupControlsTargets.forEach(control => {
        control.style.opacity = '0'
        control.style.pointerEvents = 'none'
        control.style.height = '0'
        control.style.overflow = 'hidden'
      })
    }

    // Show mobile progress
    if (this.hasMobileProgressTarget) {
      this.mobileProgressTarget.classList.remove('hidden')
    }
  }

  showSetupUI() {
    // Show nav buttons
    if (this.hasNavButtonsTarget) {
      this.navButtonsTarget.style.opacity = '1'
      this.navButtonsTarget.style.pointerEvents = 'auto'
    }

    // Show setup controls
    if (this.hasSetupControlsTarget) {
      this.setupControlsTargets.forEach(control => {
        control.style.opacity = '1'
        control.style.pointerEvents = 'auto'
        control.style.height = 'auto'
        control.style.overflow = 'visible'
      })
    }

    // Hide mobile progress
    if (this.hasMobileProgressTarget) {
      this.mobileProgressTarget.classList.add('hidden')
    }
  }

  hideGlobalMetronomeIfNeeded() {
    // Check if any segment has per-interval bpm
    const hasPerIntervalBpm = this.segmentsValue.some(segment => segment.bpm)

    if (hasPerIntervalBpm) {
      // Find and hide the metronome controls container
      const metronomeControls = document.querySelector('[data-timer-target="setupControls"]:has([data-timer-target="metronomeToggle"])')
      if (metronomeControls) {
        metronomeControls.style.display = 'none'
      }
    }
  }

  // Wake Lock API - keeps screen awake during workouts
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen')
        console.log('Wake Lock acquired')

        // Re-acquire wake lock if visibility changes (e.g., tab switching)
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released')
        })
      }
    } catch (err) {
      console.error('Wake Lock error:', err)
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release()
        this.wakeLock = null
      } catch (err) {
        console.error('Wake Lock release error:', err)
      }
    }
  }
}
