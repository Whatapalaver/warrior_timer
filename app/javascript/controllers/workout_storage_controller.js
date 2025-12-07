import { Controller } from "@hotwired/stimulus"

// Manages workout favorites and recent history using localStorage
export default class extends Controller {
  static targets = ["favoriteButton", "favoriteIcon", "favoritesList", "recentsList", "modal", "modalContent", "nameInput"]
  static values = {
    intervals: String,
    name: String
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

  // Confirm favorite with custom name
  confirmFavorite() {
    const favorites = this.getFavorites()
    const intervalCode = this.intervalsValue
    const customName = this.hasNameInputTarget ? this.nameInputTarget.value.trim() : ''
    const name = customName || this.detectWorkoutName(intervalCode)

    favorites.unshift({
      code: intervalCode,
      name: name,
      addedAt: new Date().toISOString()
    })

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
    filtered.unshift({
      code: intervalCode,
      name: name,
      usedAt: new Date().toISOString()
    })

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
  renderFavorites() {
    if (!this.hasFavoritesListTarget) return

    const favorites = this.getFavorites()

    if (favorites.length === 0) {
      this.favoritesListTarget.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-sm">
          <p class="text-lg">No favorites yet</p>
          <p class="text-xs mt-2">Click the ★ button on any timer page to save it</p>
        </div>
      `
      return
    }

    this.favoritesListTarget.innerHTML = favorites.map(fav => `
      <a href="/timer/${this.escapeHtml(fav.code)}" class="block p-6 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group relative">
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
        <div class="text-xs text-slate-500 mb-4">Added ${this.formatTimeAgo(fav.addedAt)}</div>
        <div class="preview-placeholder bg-slate-700 h-6 rounded"></div>
      </a>
    `).join('')
  }

  // Render recents list
  renderRecents() {
    if (!this.hasRecentsListTarget) return

    const recents = this.getRecents()

    if (recents.length === 0) {
      this.recentsListTarget.innerHTML = `
        <div class="col-span-2 text-center py-12 text-slate-400 text-sm">
          <p class="text-lg">No recent workouts</p>
          <p class="text-xs mt-2">Your recently used timers will appear here</p>
        </div>
      `
      return
    }

    this.recentsListTarget.innerHTML = recents.map(rec => `
      <a href="/timer/${this.escapeHtml(rec.code)}" class="block p-6 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group relative">
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
        <div class="text-xs text-slate-500 mb-4">Used ${this.formatTimeAgo(rec.usedAt)}</div>
        <div class="preview-placeholder bg-slate-700 h-6 rounded"></div>
      </a>
    `).join('')
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
}
