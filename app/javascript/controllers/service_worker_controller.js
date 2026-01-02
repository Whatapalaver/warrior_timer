import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["banner"]

  connect() {
    // Register service worker and listen for updates
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker()
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      // Check for updates on page load
      registration.update()

      // Listen for new service worker installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        newWorker.addEventListener('statechange', () => {
          // When the new service worker is installed and waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available!
            this.showUpdateBanner(newWorker)
          }
        })
      })

      // Listen for controller change (when new SW activates)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get the new version
        window.location.reload()
      })

    } catch (error) {
      console.log('Service worker registration failed:', error)
    }
  }

  showUpdateBanner(newWorker) {
    // Store the new worker for later
    this.newWorker = newWorker

    // Show the update banner
    if (this.hasBannerTarget) {
      this.bannerTarget.classList.remove('hidden')
    }
  }

  // Called when user clicks "Update Now"
  update() {
    if (this.newWorker) {
      // Tell the new service worker to skip waiting
      this.newWorker.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // Called when user dismisses the banner
  dismiss() {
    if (this.hasBannerTarget) {
      this.bannerTarget.classList.add('hidden')
    }
  }
}
