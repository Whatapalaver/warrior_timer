import { Controller } from "@hotwired/stimulus"

// Manages workout favorites and recent history using localStorage
export default class extends Controller {
  static targets = ["favoriteButton", "favoriteIcon", "favoritesList", "recentsList", "modal", "modalContent", "nameInput"]
  static values = {
    intervals: String,
    name: String,
    limit: Number
  }

  connect() {
    this.updateFavoriteButton()

    // Listen for timer start event to add to recent history
    this.element.addEventListener('timer:addToRecent', () => {
      this.addToRecent()
    })

    // Render favorites and recents if on home page
    this.renderFavorites()
    this.renderRecents()

    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'warrior_timer_favorites') {
        this.renderFavorites()
      } else if (e.key === 'warrior_timer_recents') {
        this.renderRecents()
      }
    })
  }

  // Show modal for adding favorite
  showFavoriteModal() {
    const intervalCode = this.intervalsValue

    if (this.isFavorite(intervalCode)) {
      // If already favorited, remove it
      this.removeFavoriteByInterval(intervalCode)
    } else {
      // Show modal to add
      if (this.hasModalTarget) {
        // Pre-fill with detected name
        if (this.hasNameInputTarget) {
          this.nameInputTarget.value = this.detectWorkoutName(intervalCode)
          this.nameInputTarget.select()
        }
        this.modalTarget.classList.remove('hidden')
      }
    }
  }

  // Close modal
  closeModal() {
    if (this.hasModalTarget) {
      this.modalTarget.classList.add('hidden')
      if (this.hasNameInputTarget) {
        this.nameInputTarget.value = ''
      }
    }
  }

  // Close modal when clicking backdrop
  closeModalOnBackdrop(event) {
    if (event.target === this.modalTarget) {
      this.closeModal()
    }
  }

  // Prevent keyboard events from propagating to timer controls
  preventPropagation(event) {
    event.stopPropagation()

    // Allow Enter key to submit
    if (event.key === 'Enter') {
      event.preventDefault()
      this.confirmFavorite()
    }
  }

  // Confirm favorite with custom name
  confirmFavorite() {
    const favorites = this.getFavorites()
    const intervalCode = this.intervalsValue
    const customName = this.hasNameInputTarget ? this.nameInputTarget.value.trim() : ''
    const name = customName || this.detectWorkoutName(intervalCode)

    // Get current metronome settings
    const metronomeToggle = document.querySelector('[data-timer-target="metronomeToggle"]')
    const metronomeBpm = document.querySelector('[data-timer-target="metronomeBpm"]')

    const favorite = {
      code: intervalCode,
      name: name,
      addedAt: new Date().toISOString()
    }

    // Add metronome settings if enabled
    if (metronomeToggle && metronomeToggle.checked) {
      favorite.metronome = true
      favorite.bpm = metronomeBpm ? parseInt(metronomeBpm.value) : 60
    }

    favorites.unshift(favorite)

    // Limit to 50 favorites
    if (favorites.length > 50) {
      favorites.pop()
    }

    this.saveFavorites(favorites)
    this.updateFavoriteButton()
    this.renderFavorites()
    this.closeModal()
  }

  // Remove favorite by interval code
  removeFavoriteByInterval(intervalCode) {
    const favorites = this.getFavorites().filter(f => f.code !== intervalCode)
    this.saveFavorites(favorites)
    this.updateFavoriteButton()
    this.renderFavorites()
  }

  // Add to recent history (called when timer starts)
  addToRecent() {
    const recents = this.getRecents()
    const intervalCode = this.intervalsValue

    // Remove if already exists (we'll add it to the front)
    const filtered = recents.filter(r => r.code !== intervalCode)

    // Add to front
    const name = this.hasNameValue ? this.nameValue : this.detectWorkoutName(intervalCode)

    // Get current metronome settings
    const metronomeToggle = document.querySelector('[data-timer-target="metronomeToggle"]')
    const metronomeBpm = document.querySelector('[data-timer-target="metronomeBpm"]')

    const recent = {
      code: intervalCode,
      name: name,
      usedAt: new Date().toISOString()
    }

    // Add metronome settings if enabled
    if (metronomeToggle && metronomeToggle.checked) {
      recent.metronome = true
      recent.bpm = metronomeBpm ? parseInt(metronomeBpm.value) : 60
    }

    filtered.unshift(recent)

    // Limit to 20 recent workouts
    if (filtered.length > 20) {
      filtered.pop()
    }

    this.saveRecents(filtered)
    this.renderRecents()
  }

  // Get all favorites
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('warrior_timer_favorites') || '[]')
    } catch (e) {
      console.error('Error reading favorites:', e)
      return []
    }
  }

  // Get all recents
  getRecents() {
    try {
      return JSON.parse(localStorage.getItem('warrior_timer_recents') || '[]')
    } catch (e) {
      console.error('Error reading recents:', e)
      return []
    }
  }

  // Save favorites
  saveFavorites(favorites) {
    try {
      localStorage.setItem('warrior_timer_favorites', JSON.stringify(favorites))
    } catch (e) {
      console.error('Error saving favorites:', e)
      alert('Unable to save favorite. Storage may be full.')
    }
  }

  // Save recents
  saveRecents(recents) {
    try {
      localStorage.setItem('warrior_timer_recents', JSON.stringify(recents))
    } catch (e) {
      console.error('Error saving recents:', e)
    }
  }

  // Check if current workout is favorited
  isFavorite(code = this.intervalsValue) {
    return this.getFavorites().some(f => f.code === code)
  }

  // Update favorite button appearance
  updateFavoriteButton() {
    if (!this.hasFavoriteButtonTarget) return

    if (this.isFavorite()) {
      this.favoriteButtonTarget.classList.add('text-amber-400')
      this.favoriteButtonTarget.classList.remove('text-slate-400')
      if (this.hasFavoriteIconTarget) {
        this.favoriteIconTarget.textContent = '★'
      }
    } else {
      this.favoriteButtonTarget.classList.remove('text-amber-400')
      this.favoriteButtonTarget.classList.add('text-slate-400')
      if (this.hasFavoriteIconTarget) {
        this.favoriteIconTarget.textContent = '☆'
      }
    }
  }

  // Try to detect workout name from code
  detectWorkoutName(code) {
    // Check if it matches common patterns
    if (code.match(/^8\(20w10r\)$/)) return 'Tabata'
    if (code.match(/^20\(20w10r\)$/)) return 'Extended Tabata'
    if (code.match(/^\d+\(30w30r\)$/)) return '30/30 Intervals'
    if (code.match(/^\d+\(1mw\)$/)) return 'EMOM'
    if (code.match(/^\d+\(1mw1mr\)$/)) return 'Work/Rest 1:1'

    // Extract named segments if present
    const namedMatch = code.match(/\*\[([^\]]+)\]/)
    if (namedMatch) {
      const names = namedMatch[1].split(',').slice(0, 3).join(', ')
      return `Circuit: ${names}${namedMatch[1].split(',').length > 3 ? '...' : ''}`
    }

    // Fallback to abbreviated code
    if (code.length > 30) {
      return code.substring(0, 27) + '...'
    }

    return code
  }

  // Clear all favorites (with confirmation)
  clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
      this.saveFavorites([])
      this.updateFavoriteButton()
      this.renderFavorites()
    }
  }

  // Clear all recents (with confirmation)
  clearRecents() {
    if (confirm('Are you sure you want to clear recent workouts?')) {
      this.saveRecents([])
      this.renderRecents()
    }
  }

  // Remove specific favorite by code
  removeFavorite(event) {
    const code = event.params.code
    const favorites = this.getFavorites().filter(f => f.code !== code)
    this.saveFavorites(favorites)
    this.dispatch("favoritesChanged")
  }

  // Remove specific recent by code
  removeRecent(event) {
    const code = event.params.code
    const recents = this.getRecents().filter(r => r.code !== code)
    this.saveRecents(recents)
    this.dispatch("recentsChanged")
  }

  // Render favorites list
  async renderFavorites() {
    if (!this.hasFavoritesListTarget) return

    const allFavorites = this.getFavorites()
    const limit = this.hasLimitValue ? this.limitValue : allFavorites.length
    const favorites = allFavorites.slice(0, limit)

    if (favorites.length === 0) {
      this.favoritesListTarget.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-sm">
          <p class="text-lg">No favorites yet</p>
          <p class="text-xs mt-2">Click the ★ button on any timer page to save it</p>
        </div>
      `
      return
    }

    // Render with placeholders first for immediate feedback
    this.favoritesListTarget.innerHTML = favorites.map(fav => {
      let url = `/timer/${this.escapeHtml(fav.code)}`
      if (fav.metronome) {
        url += `?metronome=true&bpm=${fav.bpm || 60}`
      }

      return `
        <a href="${url}" class="block p-6 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group relative" data-code="${this.escapeHtml(fav.code)}">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-xl font-bold text-amber-400">${this.escapeHtml(fav.name)}</h3>
            <button
              data-action="click->workout-storage#removeFavoriteByCode"
              data-code="${this.escapeHtml(fav.code)}"
              onclick="event.preventDefault(); event.stopPropagation();"
              class="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove favorite"
            >
              ✕
            </button>
          </div>
          <code class="text-sm text-slate-300 block mb-2">${this.escapeHtml(fav.code)}</code>
          ${fav.metronome ? `<div class="text-xs text-emerald-400 mb-2">♪ ${fav.bpm} BPM</div>` : ''}
          <div class="text-xs text-slate-500 mb-4">Added ${this.formatTimeAgo(fav.addedAt)}</div>
          <div class="preview-container bg-slate-700 h-6 rounded animate-pulse"></div>
        </a>
      `
    }).join('')

    // Load previews asynchronously
    for (const fav of favorites) {
      this.loadPreview(fav.code, 'favorite')
    }
  }

  // Render recents list
  async renderRecents() {
    if (!this.hasRecentsListTarget) return

    const allRecents = this.getRecents()
    const limit = this.hasLimitValue ? this.limitValue : allRecents.length
    const recents = allRecents.slice(0, limit)

    if (recents.length === 0) {
      this.recentsListTarget.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-sm">
          <p class="text-lg">No recent workouts</p>
          <p class="text-xs mt-2">Your recently used timers will appear here</p>
        </div>
      `
      return
    }

    // Render with placeholders first for immediate feedback
    this.recentsListTarget.innerHTML = recents.map(rec => {
      let url = `/timer/${this.escapeHtml(rec.code)}`
      if (rec.metronome) {
        url += `?metronome=true&bpm=${rec.bpm || 60}`
      }

      return `
        <a href="${url}" class="block p-6 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group relative" data-code="${this.escapeHtml(rec.code)}">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-xl font-bold text-emerald-400">${this.escapeHtml(rec.name)}</h3>
            <button
              data-action="click->workout-storage#removeRecentByCode"
              data-code="${this.escapeHtml(rec.code)}"
              onclick="event.preventDefault(); event.stopPropagation();"
              class="text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove from recents"
            >
              ✕
            </button>
          </div>
          <code class="text-sm text-slate-300 block mb-2">${this.escapeHtml(rec.code)}</code>
          ${rec.metronome ? `<div class="text-xs text-emerald-400 mb-2">♪ ${rec.bpm} BPM</div>` : ''}
          <div class="text-xs text-slate-500 mb-4">Used ${this.formatTimeAgo(rec.usedAt)}</div>
          <div class="preview-container bg-slate-700 h-6 rounded animate-pulse"></div>
        </a>
      `
    }).join('')

    // Load previews asynchronously
    for (const rec of recents) {
      this.loadPreview(rec.code, 'recent')
    }
  }

  // Remove favorite by code (called from rendered button)
  removeFavoriteByCode(event) {
    const code = event.currentTarget.dataset.code
    const favorites = this.getFavorites().filter(f => f.code !== code)
    this.saveFavorites(favorites)
    this.renderFavorites()
    this.updateFavoriteButton()
  }

  // Remove recent by code (called from rendered button)
  removeRecentByCode(event) {
    const code = event.currentTarget.dataset.code
    const recents = this.getRecents().filter(r => r.code !== code)
    this.saveRecents(recents)
    this.renderRecents()
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Format time ago
  formatTimeAgo(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  // Load and render preview for a workout
  async loadPreview(code, type) {
    try {
      const response = await fetch(`/api/parse_intervals?intervals=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (data.error) {
        console.error('Preview error:', data.error)
        return
      }

      const previewHTML = this.renderPreviewHTML(data.segments, data.total_duration)

      // Find the card and update its preview
      const targetList = type === 'favorite' ? this.favoritesListTarget : this.recentsListTarget
      const card = targetList.querySelector(`a[data-code="${this.escapeHtml(code)}"]`)

      if (card) {
        const previewContainer = card.querySelector('.preview-container')
        if (previewContainer) {
          previewContainer.outerHTML = previewHTML
        }
      }
    } catch (error) {
      console.error('Failed to load preview:', error)
    }
  }

  // Render preview HTML from segments data
  renderPreviewHTML(segments, totalDuration) {
    if (!segments || segments.length === 0) {
      return '<div class="h-6 w-full bg-slate-700 rounded"></div>'
    }

    const segmentColors = {
      work: 'bg-red-500',
      rest: 'bg-blue-500',
      prepare: 'bg-amber-500',
      warmup: 'bg-green-500',
      cooldown: 'bg-purple-500'
    }

    const segmentsHTML = segments.map((segment, index) => {
      const width = totalDuration > 0 ? (segment.duration_seconds / totalDuration * 100).toFixed(2) : 0
      const color = segmentColors[segment.segment_type] || 'bg-slate-500'
      const border = index < segments.length - 1 ? 'border-r border-slate-300' : ''

      return `
        <div
          class="${color} transition-all hover:brightness-110 ${border}"
          style="width: ${width}%"
          title="${segment.segment_type}: ${segment.duration_seconds}s"
        ></div>
      `
    }).join('')

    return `<div class="h-6 w-full flex rounded overflow-hidden border border-slate-600">${segmentsHTML}</div>`
  }
}
