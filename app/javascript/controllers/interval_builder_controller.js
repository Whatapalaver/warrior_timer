import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview", "error", "goButton"]

  connect() {
    this.parse()
  }

  parse() {
    const input = this.inputTarget.value.trim()

    if (!input) {
      this.showEmpty()
      return
    }

    // Call the Rails endpoint to parse
    fetch(`/api/parse_intervals?intervals=${encodeURIComponent(input)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.showError(data.error)
        } else {
          this.showPreview(data.segments, input)
        }
      })
      .catch(err => {
        console.error('Parse error:', err)
        this.showError('Failed to parse intervals')
      })
  }

  showEmpty() {
    this.previewTarget.innerHTML = `
      <div class="text-center text-slate-400 py-8">
        <p class="text-lg">Start typing to see a preview...</p>
        <p class="text-sm mt-2">Try: <code class="text-amber-400">10(30w30r)</code></p>
      </div>
    `
    this.errorTarget.classList.add('hidden')
    this.goButtonTarget.classList.add('hidden')
  }

  showError(message) {
    this.errorTarget.textContent = message
    this.errorTarget.classList.remove('hidden')
    this.previewTarget.innerHTML = ''
    this.goButtonTarget.classList.add('hidden')
  }

  showPreview(segments, input) {
    this.errorTarget.classList.add('hidden')

    // Show Go button - don't encode, Rails routing handles it
    this.goButtonTarget.href = `/timer/${input}`
    this.goButtonTarget.classList.remove('hidden')

    // Build visual preview
    const colors = {
      prepare: { bg: 'bg-amber-500', name: 'Prep', textColor: 'text-amber-300' },
      warmup: { bg: 'bg-orange-500', name: 'Warmup', textColor: 'text-orange-300' },
      work: { bg: 'bg-red-600', name: 'Work', textColor: 'text-red-300' },
      rest: { bg: 'bg-emerald-500', name: 'Rest', textColor: 'text-emerald-300' },
      cooldown: { bg: 'bg-sky-500', name: 'Cooldown', textColor: 'text-sky-300' }
    }

    // Calculate total duration for proportional widths
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0)
    const maxSegmentsToShow = 50 // Limit visual complexity

    let html = '<div class="space-y-4">'

    // Summary
    html += `
      <div class="flex justify-between text-sm text-slate-400">
        <span>${segments.length} segments</span>
        <span>Total: ${this.formatDuration(totalDuration)}</span>
      </div>
    `

    // Visual timeline
    html += '<div class="flex gap-0.5 h-12 rounded overflow-hidden">'

    const segmentsToShow = segments.slice(0, maxSegmentsToShow)
    segmentsToShow.forEach((seg, idx) => {
      const widthPercent = (seg.duration_seconds / totalDuration) * 100
      const color = colors[seg.segment_type] || colors.work
      const title = `${color.name}: ${this.formatDuration(seg.duration_seconds)}`

      html += `
        <div
          class="${color.bg} flex-shrink-0 hover:opacity-80 transition-opacity cursor-help"
          style="width: ${widthPercent}%"
          title="${title}"
        ></div>
      `
    })

    html += '</div>'

    if (segments.length > maxSegmentsToShow) {
      html += `<p class="text-xs text-slate-400 text-center">Showing first ${maxSegmentsToShow} of ${segments.length} segments</p>`
    }

    // Breakdown by type
    html += '<div class="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">'

    const breakdown = {}
    segments.forEach(seg => {
      const type = seg.segment_type
      if (!breakdown[type]) {
        breakdown[type] = { count: 0, duration: 0 }
      }
      breakdown[type].count++
      breakdown[type].duration += seg.duration_seconds
    })

    Object.entries(breakdown).forEach(([type, data]) => {
      const color = colors[type] || colors.work
      html += `
        <div class="bg-slate-800 rounded p-3 text-center">
          <div class="text-xs ${color.textColor} font-semibold">${color.name}</div>
          <div class="text-lg font-bold">${data.count}</div>
          <div class="text-xs text-slate-400">${this.formatDuration(data.duration)}</div>
        </div>
      `
    })

    html += '</div>'
    html += '</div>'

    this.previewTarget.innerHTML = html
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    return `${secs}s`
  }

  goToTimer() {
    const input = this.inputTarget.value.trim()
    if (input) {
      window.location.href = `/timer/${input}`
    }
  }
}
