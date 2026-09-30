import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sectionsList"]

  connect() {
    this.element.querySelector("form")?.addEventListener("submit", this.reindexAll.bind(this))
    this.element.querySelectorAll("[data-section], [data-protocol]").forEach(item => {
      this._initDragHandleForItem(item)
    })
  }

  // ── Section actions ────────────────────────────────────────────────────────

  addSection() {
    const template = document.getElementById("section-template")
    const clone = template.content.cloneNode(true)
    const section = clone.querySelector("[data-section]")
    const index = this.sectionsList().children.length
    this._setIndex(section, index)
    this._initDragHandleForItem(section)
    this.sectionsList().appendChild(section)
  }

  removeSection(event) {
    event.currentTarget.closest("[data-section]").remove()
  }

  toggleSection(event) {
    const section = event.currentTarget.closest("[data-section]")
    const body = section.querySelector("[data-section-body]")
    if (body) body.classList.toggle("hidden")
  }

  // ── Protocol actions ───────────────────────────────────────────────────────

  addProtocol(event) {
    const sectionIndex = event.params.section
    const section = this.sectionsList().querySelector(`[data-section][data-section-index="${sectionIndex}"]`)
    const protocolList = section.querySelector("[data-protocols-list]")
    const template = document.getElementById("protocol-template")
    const clone = template.content.cloneNode(true)
    const protocol = clone.querySelector("[data-protocol]")
    const protocolIndex = protocolList.children.length
    this._setProtocolIndex(protocol, sectionIndex, protocolIndex)
    this._initDragHandleForItem(protocol)
    protocolList.appendChild(protocol)
  }

  removeProtocol(event) {
    event.currentTarget.closest("[data-protocol]").remove()
  }

  // ── Reindex before submit ──────────────────────────────────────────────────

  reindexAll() {
    const sections = Array.from(this.sectionsList().querySelectorAll(":scope > [data-section]"))
    sections.forEach((section, si) => {
      section.dataset.sectionIndex = si

      // Rename all fields' section index first (match numeric or placeholder)
      this._renameFields(section, /sections\[(?:\d+|__SI__)\]/, `sections[${si}]`)

      const protocolList = section.querySelector("[data-protocols-list]")
      if (!protocolList) return
      const protocols = Array.from(protocolList.querySelectorAll(":scope > [data-protocol]"))
      protocols.forEach((protocol, pi) => {
        // Replace the protocol index (numeric or placeholder) in the full path
        this._renameFields(
          protocol,
          /sections\[\d+\]\[protocols\]\[(?:\d+|__PI__)\]/,
          `sections[${si}][protocols][${pi}]`
        )
      })
    })
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  sectionsList() {
    return this.sectionsListTarget
  }

  _setIndex(section, index) {
    section.dataset.sectionIndex = index
    section.querySelectorAll("[name]").forEach(field => {
      // Replace either a numeric index or the __SI__ placeholder
      field.name = field.name.replace(/sections\[(?:\d+|__SI__)\]/, `sections[${index}]`)
    })
    // Update addProtocol param
    const addBtn = section.querySelector("[data-admin-protocols-section-param]")
    if (addBtn) addBtn.dataset.adminProtocolsSectionParam = index
  }

  _setProtocolIndex(protocol, sectionIndex, protocolIndex) {
    protocol.querySelectorAll("[name]").forEach(field => {
      // Build name from scratch using the last key segment, replacing both placeholders
      const key = this._protocolFieldKey(field.name)
      field.name = `sections[${sectionIndex}][protocols][${protocolIndex}][${key}]`
    })
  }

  _protocolFieldKey(name) {
    // Extract last bracket segment: [...][key]
    const match = name.match(/\[([^\]]+)\]$/)
    return match ? match[1] : name
  }

  _renameFields(container, pattern, replacement) {
    container.querySelectorAll("[name]").forEach(field => {
      field.name = field.name.replace(pattern, replacement)
    })
  }

  _initDragHandleForItem(item) {
    const handle = item.querySelector("[data-drag-handle]")
    if (!handle) return

    const isSection = item.hasAttribute("data-section")

    handle.addEventListener("mousedown", () => { item.draggable = true })
    handle.addEventListener("touchstart", () => { item.draggable = true }, { passive: true })

    item.addEventListener("dragstart", (e) => {
      if (isSection) { this._draggedItem = item } else { this._draggedProtocol = item }
      item.classList.add("opacity-50")
      e.dataTransfer.effectAllowed = "move"
      e.stopPropagation()
    })

    item.addEventListener("dragover", (e) => {
      const dragged = isSection ? this._draggedItem : this._draggedProtocol
      if (!dragged || dragged === item) return
      if (!isSection && dragged.closest("[data-protocols-list]") !== item.closest("[data-protocols-list]")) return
      e.preventDefault()
      e.stopPropagation()
      const rect = item.getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        item.parentNode.insertBefore(dragged, item)
      } else {
        item.parentNode.insertBefore(dragged, item.nextSibling)
      }
    })

    item.addEventListener("drop", (e) => { e.preventDefault(); e.stopPropagation() })

    item.addEventListener("dragend", () => {
      item.classList.remove("opacity-50")
      item.draggable = false
      if (isSection) { this._draggedItem = null } else { this._draggedProtocol = null }
    })
  }
}
