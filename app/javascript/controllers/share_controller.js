import { Controller } from "@hotwired/stimulus"

// Manages sharing and embedding timers
export default class extends Controller {
  static targets = ["modal", "modalContent", "directLink", "embedCode", "embedPreview"]
  static values = {
    code: String
  }

  connect() {
    this.updateLinks()
  }

  // Show the share modal
  showModal() {
    if (this.hasModalTarget) {
      this.updateLinks()
      this.modalTarget.classList.remove('hidden')
    }
  }

  // Close the modal
  closeModal() {
    if (this.hasModalTarget) {
      this.modalTarget.classList.add('hidden')
    }
  }

  // Close modal when clicking backdrop
  closeModalOnBackdrop(event) {
    if (event.target === this.modalTarget) {
      this.closeModal()
    }
  }

  // Update all the links and embed codes
  updateLinks() {
    const baseUrl = window.location.origin
    const timerUrl = `${baseUrl}/timer/${encodeURIComponent(this.codeValue)}`
    const embedUrl = `${baseUrl}/embed/${encodeURIComponent(this.codeValue)}`

    // Update direct link
    if (this.hasDirectLinkTarget) {
      this.directLinkTarget.value = timerUrl
    }

    // Update embed code
    if (this.hasEmbedCodeTarget) {
      this.embedCodeTarget.value = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allow="autoplay"></iframe>`
    }

    // Update embed preview link
    if (this.hasEmbedPreviewTarget) {
      this.embedPreviewTarget.href = embedUrl
    }
  }

  // Copy direct link to clipboard
  async copyDirectLink() {
    await this.copyToClipboard(this.directLinkTarget.value, 'Direct link copied!')
  }

  // Copy embed code to clipboard
  async copyEmbedCode() {
    await this.copyToClipboard(this.embedCodeTarget.value, 'Embed code copied!')
  }

  // Helper to copy text to clipboard
  async copyToClipboard(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text)

      // Show a temporary success message (could enhance with a toast notification)
      const originalTitle = document.title
      document.title = successMessage
      setTimeout(() => {
        document.title = originalTitle
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }
}
